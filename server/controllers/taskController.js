const Task = require('../models/task');
const User = require('../models/user');
const { VM } = require('vm2');
const NodeCache = require('node-cache');

const cache = new NodeCache({ 
  stdTTL: 60,
  checkperiod: 120
});

global.taskCache = cache;

exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const lang = req.query.lang || 'ru';
    const isAdmin = req.user && req.user.role === 'admin';
    
    const filters = {};
    
    if (req.query.difficulty && ['easy', 'medium', 'hard'].includes(req.query.difficulty)) {
      filters.difficulty = req.query.difficulty;
    }

    // Фильтрация по статусу публикации
    if (req.query.isPublished !== undefined && isAdmin) {
      // Для админов - фильтруем по запрошенному статусу
      if (req.query.isPublished === 'false') {
        filters.isPublished = false;
      } else if (req.query.isPublished === 'true') {
        filters.isPublished = true;
      } else if (req.query.isPublished === 'all') {
        // Для значения 'all' не добавляем фильтр isPublished совсем
      }
    } else if (!isAdmin) {
      // Для обычных пользователей - показываем только опубликованные задачи
      filters.isPublished = true;
    }

    if (req.query.search && req.query.search.trim()) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { [`translations.ru.title`]: { $regex: req.query.search, $options: 'i' } },
        { [`translations.ru.description`]: { $regex: req.query.search, $options: 'i' } },
        { [`translations.en.title`]: { $regex: req.query.search, $options: 'i' } },
        { [`translations.en.description`]: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    let completedTaskIds = [];
    if (req.query.hideSolved === 'true' && req.user) {
      const user = await User.findById(req.user.id, 'completedTasks').lean();
      if (user && user.completedTasks) {
        completedTaskIds = user.completedTasks.map(task => task.taskId);
        filters._id = { $nin: completedTaskIds };
      }
    }
    
    const cacheKey = `tasks_${filters.difficulty || 'all'}_${req.query.hideSolved || 'false'}_${page}_${limit}_${req.query.sortBy || 'createdAt'}_${req.query.sortOrder || 'asc'}_${req.query.search || ''}_${lang}_${filters.isPublished !== undefined ? filters.isPublished : 'all'}_${isAdmin ? 'admin' : 'user'}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data for key:', cacheKey);
      return res.json(cachedData);
    }
    
    let tasks, totalTasks;
    if (req.query.sortBy === 'difficulty') {
      const difficultyOrder = {
        'hard': 1,
        'medium': 2,
        'easy': 3
      };
      
      const sortDirection = req.query.sortOrder === 'desc' ? -1 : 1;
      
      const pipeline = [
        { $match: filters },
        {
          $addFields: {
            difficultyOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'hard'] }, then: 1 },
                  { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                  { case: { $eq: ['$difficulty', 'easy'] }, then: 3 }
                ],
                default: 4
              }
            }
          }
        },
        { $sort: { difficultyOrder: sortDirection, _id: 1 } },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            difficulty: 1,
            createdAt: 1,
            updatedAt: 1,
            translations: 1,
            isPublished: 1
          }
        },
        { $skip: skip },
        { $limit: limit }
      ];
      
      [totalTasks, tasks] = await Promise.all([
        Task.aggregate([
          { $match: filters },
          { $count: 'total' }
        ]).then(result => result[0]?.total || 0),
        Task.aggregate(pipeline)
      ]);
    } else if (req.query.sortBy === 'isPublished') {
      const sortDirection = req.query.sortOrder === 'desc' ? -1 : 1;
      
      const pipeline = [
        { $match: filters },
        { $sort: { isPublished: sortDirection, _id: 1 } },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            difficulty: 1,
            createdAt: 1,
            updatedAt: 1,
            translations: 1,
            isPublished: 1
          }
        },
        { $skip: skip },
        { $limit: limit }
      ];
      
      [totalTasks, tasks] = await Promise.all([
        Task.aggregate([
          { $match: filters },
          { $count: 'total' }
        ]).then(result => result[0]?.total || 0),
        Task.aggregate(pipeline)
      ]);
    } else {
      const sortOptions = {};
      sortOptions[req.query.sortBy || 'createdAt'] = req.query.sortOrder === 'desc' ? -1 : 1;
      
      [totalTasks, tasks] = await Promise.all([
        Task.countDocuments(filters),
        Task.find(filters, 'title description category difficulty createdAt updatedAt translations isPublished')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
      ]);
    }

    const transformedTasks = tasks.map(task => {
      let title, description;
      
      if (task.translations) {
        const translation = task.translations[lang] || task.translations.ru || {};
        title = translation.title || task.title;
        description = translation.description || task.description;
      } else {
        title = task.title;
        description = task.description;
      }
      
      const { translations, ...rest } = task;
      
      return {
        ...rest,
        title,
        description,
        status: rest.isPublished ? 'published' : 'draft'
      };
    });

    const totalPages = Math.ceil(totalTasks / limit);
    
    // Проверка на дубликаты задач по ID и удаление их
    const uniqueTaskIds = new Set();
    const uniqueTasks = transformedTasks.filter(task => {
      const isDuplicate = uniqueTaskIds.has(task._id.toString());
      uniqueTaskIds.add(task._id.toString());
      return !isDuplicate;
    });
    
    const result = {
      tasks: uniqueTasks,
      currentPage: page,
      totalPages,
      totalTasks
    };
    
    console.log('Caching result for key:', cacheKey);
    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка задач' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';
    const lang = req.query.lang || 'ru';
    
    if (isAdmin) {
      const fullTask = await Task.findById(taskId).lean();
      if (!fullTask) {
        return res.status(404).json({ message: 'Задание не найдено' });
      }
      return res.json({
        ...fullTask,
        isCompleted: false
      });
    }
    
    const cacheKey = `task_${taskId}_user_${userId || 'guest'}_lang_${lang}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const task = await Task.findOne({ _id: taskId, isPublished: true }).lean();
    
    if (!task) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }
    
    let isCompleted = false;
    let user = null;
    
    if (userId) {
      user = await User.findById(userId, 'completedTasks').lean();
      if (user && user.completedTasks) {
        isCompleted = user.completedTasks.some(
          completedTask => completedTask.taskId.toString() === taskId
        );
      }
    }

    let title, description, requirements, template;
    
    if (task.translations) {
      const translation = task.translations[lang] || task.translations.ru || {};
      title = translation.title || task.title;
      description = translation.description || task.description;
      requirements = translation.requirements || task.requirements || [];
      template = translation.template || task.template || '';
    } else {
      title = task.title;
      description = task.description;
      requirements = task.requirements || [];
      template = task.template || '';
    }
    
    const result = {
      ...task,
      title,
      description,
      requirements,
      template,
      isCompleted
    };
    
    if (!isAdmin) {
      delete result.solution;
    }
    
    cache.set(cacheKey, result, 60);
    res.json(result);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задания' });
  }
};

exports.checkSolution = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user ? req.user.id : null;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const { solution } = req.body;
    
    if (!solution || solution.trim().length === 0) {
      return res.status(400).json({ message: 'Решение не может быть пустым' });
    }

    const functionName = extractFunctionName(task.template);
    if (!functionName) {
      return res.status(400).json({ message: 'Не удалось определить имя функции в шаблоне' });
    }

    const results = [];
    let allTestsPassed = true;

    for (const test of task.tests) {
      try {
        const vm = new VM({
          timeout: 3000,
          sandbox: {
            console: { log: () => {} },
            JSON: JSON
          }
        });

        let input;
        try {
          input = JSON.parse(test.input);
        } catch (e) {
          console.error(`Не удалось разобрать input как JSON: ${test.input}`, e);
          input = test.input;
        }

        let expectedOutput;
        try {
          expectedOutput = JSON.parse(test.expectedOutput);
        } catch (e) {
          console.error(`Не удалось разобрать expectedOutput как JSON: ${test.expectedOutput}`, e);
          expectedOutput = test.expectedOutput;
        }

        const testCode = `
          ${solution}
          ${test.testCode}
          test(${functionName});
        `;

        console.log(`Выполняемый testCode для теста "${test.description}":\n${testCode}`);

        const testResult = vm.run(testCode);

        const isEqual = typeof testResult === 'boolean' ? testResult : deepEqual(testResult, expectedOutput);

        results.push({
          input: test.input,
          passed: isEqual,
          description: test.description || 'Проверка решения',
          actual: JSON.stringify(testResult),
          expected: JSON.stringify(expectedOutput)
        });

        if (!isEqual) {
          allTestsPassed = false;
        }
      } catch (error) {
        console.error(`Ошибка выполнения теста "${test.description}":`, error);
        results.push({
          input: test.input,
          passed: false,
          error: error.message,
          description: test.description || 'Проверка решения'
        });
        allTestsPassed = false;
      }
    }

    let progressUpdate = null;
    
    if (allTestsPassed && userId) {
      const user = await User.findById(userId);
      const completedTask = user.completedTasks.find(
        completedTask => completedTask.taskId.toString() === taskId
      );
      
      if (!completedTask) {
        let pointsEarned = 10;
        if (task.difficulty === 'medium') {
          pointsEarned = 20;
        } else if (task.difficulty === 'hard') {
          pointsEarned = 30;
        }
        
        task.completionCount += 1;
        await task.save();
        
        const newPoints = user.points + pointsEarned;
        // Формула расчета уровня: level = Math.floor(Math.sqrt(points / 100)) + 1
        // Это означает, что для уровня N требуется 100 * (N-1)^2 очков
        // Например: уровень 2 = 100 очков, уровень 3 = 400 очков, уровень 4 = 900 очков
        const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;
        const levelUp = newLevel > user.level;
        
        user.completedTasks.push({
          taskId,
          category: task.category,
          points: pointsEarned,
          completedAt: new Date()
        });
        
        user.points = newPoints;
        user.level = newLevel;
        
        await user.save();
        
        progressUpdate = {
          pointsEarned,
          points: user.points,
          level: user.level,
          levelUp,
          totalCompleted: user.completedTasks.length,
          previouslyCompleted: false
        };
        
        cache.del(`user_${userId}`);
        cache.del(`progress_${userId}`);
      } else {
        progressUpdate = {
          pointsEarned: completedTask.points,
          points: user.points,
          level: user.level,
          levelUp: false,
          totalCompleted: user.completedTasks.length,
          previouslyCompleted: true,
          completedAt: completedTask.completedAt
        };
      }
    } else if (allTestsPassed) {
      progressUpdate = {
        pointsEarned: 0,
        points: 0,
        level: 1,
        levelUp: false,
        totalCompleted: 0,
        previouslyCompleted: false
      };
    }
    
    res.json({
      success: allTestsPassed,
      results,
      progressUpdate
    });
  } catch (error) {
    console.error('Ошибка проверки решения:', error);
    res.status(500).json({ message: 'Ошибка сервера при проверке решения' });
  }
};

exports.testCheckSolution = async (req, res) => {
  try {
    const { taskId, solution } = req.body;
    
    if (!taskId || !solution) {
      return res.status(400).json({ message: 'Необходимо указать ID задачи и решение' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    const functionName = extractFunctionName(task.template);
    if (!functionName) {
      return res.status(400).json({ message: 'Не удалось определить имя функции в шаблоне' });
    }

    const results = [];
    let allTestsPassed = true;

    for (const test of task.tests) {
      try {
        const vm = new VM({
          timeout: 3000,
          sandbox: { console: { log: () => {} } }
        });

        let input;
        try {
          input = JSON.parse(test.input);
        } catch (e) {
          if (test.input.startsWith('[') && test.input.endsWith(']')) {
            try {
              input = eval(`(${test.input})`);
            } catch (evalError) {
              input = test.input;
            }
          } else {
            input = test.input;
          }
        }

        let expectedOutput;
        try {
          expectedOutput = JSON.parse(test.expectedOutput);
        } catch (e) {
          if (test.expectedOutput.startsWith('[') && test.expectedOutput.endsWith(']')) {
            try {
              expectedOutput = eval(`(${test.expectedOutput})`);
            } catch (evalError) {
              expectedOutput = test.expectedOutput;
            }
          } else {
            expectedOutput = test.expectedOutput;
          }
        }

        const testCode = `
          ${solution}
          const input = ${typeof input === 'object' ? JSON.stringify(input) : `"${input}"`};
          const result = ${functionName}(${typeof input === 'object' ? 'JSON.parse(input)' : 'input'});
          result;
        `;

        const actualResult = vm.run(testCode);
        
        const isEqual = deepEqual(actualResult, expectedOutput);
        
        results.push({
          input: test.input,
          passed: isEqual,
          actual: JSON.stringify(actualResult),
          expected: JSON.stringify(expectedOutput),
          error: null
        });

        if (!isEqual) {
          allTestsPassed = false;
        }
      } catch (error) {
        results.push({
          input: test.input,
          passed: false,
          actual: null,
          expected: JSON.stringify(expectedOutput),
          error: error.message
        });
        allTestsPassed = false;
      }
    }

    res.json({
      success: allTestsPassed,
      results
    });
  } catch (error) {
    console.error('Ошибка при проверке решения:', error);
    res.status(500).json({ message: 'Ошибка сервера при проверке решения' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      requirements,
      tests,
      hints,
      template,
      solution,
      isPublished,
      translations
    } = req.body;

    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({
        message: 'Необходимо заполнить все обязательные поля: название, описание, категория и сложность.'
      });
    }

    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({
        message: 'Необходимо добавить хотя бы один тест для проверки решения.'
      });
    }

    let difficultyLevel;
    if (difficulty === 'Начальный' || difficulty === 'beginner') {
      difficultyLevel = 'easy';
    } else if (difficulty === 'Средний' || difficulty === 'intermediate') {
      difficultyLevel = 'medium';
    } else if (difficulty === 'Продвинутый' || difficulty === 'advanced') {
      difficultyLevel = 'hard';
    } else {
      difficultyLevel = difficulty;
    }

    const taskData = {
      title,
      description,
      category,
      difficulty: difficultyLevel,
      requirements: requirements || [],
      tests: tests.map(test => ({
        input: test.input,
        expectedOutput: test.expectedOutput,
        testCode: test.testCode,
        description: test.description || ''
      })),
      hints: hints || [],
      template: template || '',
      solution: solution || '',
      isPublished: isPublished !== undefined ? isPublished : true
    };

    if (translations) {
      taskData.translations = {};
      
      if (translations.ru) {
        taskData.translations.ru = {
          title: translations.ru.title || title,
          description: translations.ru.description || description,
          requirements: translations.ru.requirements || requirements || [],
          template: translations.ru.template || template || '',
          hints: translations.ru.hints || hints || [],
          testDescriptions: translations.ru.testDescriptions || {}
        };
      } else {
        taskData.translations.ru = {
          title: title,
          description: description,
          requirements: requirements || [],
          template: template || '',
          hints: hints || [],
          testDescriptions: {}
        };
      }
      
      if (translations.en && (translations.en.title || translations.en.description)) {
        taskData.translations.en = {
          title: translations.en.title || '',
          description: translations.en.description || '',
          requirements: translations.en.requirements || [],
          template: translations.en.template || '',
          hints: translations.en.hints || [],
          testDescriptions: translations.en.testDescriptions || {}
        };
      }
    }

    const newTask = new Task(taskData);

    await newTask.save();
    clearTasksCache();
    
    res.status(201).json({
      message: 'Задача успешно создана',
      task: {
        _id: newTask._id,
        title: newTask.title,
        category: newTask.category,
        difficulty: newTask.difficulty,
        isPublished: newTask.isPublished,
        createdAt: newTask.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании задачи' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    console.log('Начало обновления задачи:', {
      taskId,
      body: { ...req.body, solution: req.body.solution ? '***' : undefined }
    });
    
    if (!taskId || taskId === 'undefined') {
      return res.status(400).json({ message: 'Некорректный ID задачи' });
    }

    if (req.user.role !== 'admin') {
      console.log('Нет прав на редактирование:', {
        userId: req.user.id,
        userRole: req.user.role
      });
      return res.status(403).json({ message: 'Только администраторы могут редактировать задачи' });
    }
    
    const {
      title,
      description,
      category,
      difficulty,
      requirements,
      tests,
      hints,
      template,
      solution,
      isPublished,
      translations
    } = req.body;

    if (!title || !description || !category || !difficulty || !solution) {
      console.log('Отсутствуют обязательные поля:', {
        title: !!title,
        description: !!description,
        category: !!category,
        difficulty: !!difficulty,
        solution: !!solution
      });
      return res.status(400).json({
        message: 'Необходимо заполнить все обязательные поля: название, описание, категория, сложность и решение'
      });
    }

    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      console.log('Некорректные тесты:', { tests });
      return res.status(400).json({
        message: 'Необходимо добавить хотя бы один тест для проверки решения'
      });
    }

    for (const test of tests) {
      if (!test.input || !test.expectedOutput) {
        console.log('Некорректный тест:', { test });
        return res.status(400).json({
          message: 'Каждый тест должен содержать входные данные и ожидаемый результат'
        });
      }
    }

    const task = await Task.findById(taskId);
    if (!task) {
      console.log('Задача не найдена:', { taskId });
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    let difficultyLevel;
    if (difficulty === 'Начальный' || difficulty === 'beginner') {
      difficultyLevel = 'easy';
    } else if (difficulty === 'Средний' || difficulty === 'intermediate') {
      difficultyLevel = 'medium';
    } else if (difficulty === 'Продвинутый' || difficulty === 'advanced') {
      difficultyLevel = 'hard';
    } else {
      difficultyLevel = difficulty;
    }

    const updateData = {
      title,
      description,
      category,
      difficulty: difficultyLevel,
      requirements: Array.isArray(requirements) ? requirements : [],
      tests: tests.map(test => ({
        input: test.input || '',
        expectedOutput: test.expectedOutput || '',
        testCode: test.testCode || '',
        description: test.description || ''
      })),
      hints: Array.isArray(hints) ? hints : [],
      template: template || '',
      solution: solution,
      isPublished: isPublished !== undefined ? isPublished : true,
      updatedAt: new Date()
    };
    
    if (translations) {
      updateData.translations = {};
      
      if (translations.ru) {
        updateData.translations.ru = {
          title: translations.ru.title || title,
          description: translations.ru.description || description,
          requirements: translations.ru.requirements || requirements || [],
          template: translations.ru.template || template || '',
          hints: translations.ru.hints || hints || [],
          testDescriptions: translations.ru.testDescriptions || {}
        };
      } else {
        updateData.translations.ru = {
          title: title,
          description: description,
          requirements: requirements || [],
          template: template || '',
          hints: hints || [],
          testDescriptions: {}
        };
      }
      
      if (translations.en && (translations.en.title || translations.en.description)) {
        updateData.translations.en = {
          title: translations.en.title || '',
          description: translations.en.description || '',
          requirements: translations.en.requirements || [],
          template: translations.en.template || '',
          hints: translations.en.hints || [],
          testDescriptions: translations.en.testDescriptions || {}
        };
      }
    }
    
    console.log('Подготовленные данные для обновления:', {
      taskId,
      updateData: { ...updateData, solution: updateData.solution ? '***' : undefined }
    });

    try {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!updatedTask) {
        console.log('Ошибка при обновлении задачи: задача не найдена после обновления');
        return res.status(500).json({ message: 'Ошибка при обновлении задачи' });
      }
      
      console.log('Задача успешно обновлена:', { taskId, title: updatedTask.title });
      
      clearTasksCache();
      clearTaskCache(taskId);
      
      res.json({
        message: 'Задача успешно обновлена',
        task: updatedTask
      });
    } catch (updateError) {
      console.error('Ошибка при выполнении findByIdAndUpdate:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('Ошибки валидации:', messages);
      return res.status(400).json({ 
        message: 'Ошибка валидации',
        details: messages 
      });
    }
    
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении задачи',
      details: error.message 
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только администраторы могут удалять задачи' });
    }
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    await Task.findByIdAndDelete(taskId);
    clearTasksCache();
    clearTaskCache(taskId);
    
    res.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении задачи' });
  }
};

function clearTaskCache(taskId, userId) {
  if (userId) {
    cache.del(`task_${taskId}_user_${userId}`);
  }
  const keys = cache.keys();
  const taskKeys = keys.filter(key => key.startsWith(`task_${taskId}`));
  taskKeys.forEach(key => cache.del(key));
}

function clearTasksCache() {
  cache.flushAll();
}

exports.patchTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ message: 'Некорректный ID задачи' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только администраторы могут изменять задачи' });
    }

    const { isPublished } = req.body;
    if (isPublished === undefined) {
      return res.status(400).json({ message: 'Необходимо указать статус публикации' });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { isPublished, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    console.log('Clearing cache for task:', taskId);
    clearTasksCache();
    clearTaskCache(taskId);

    res.json({
      message: 'Статус задачи успешно обновлен',
      task
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса задачи:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении статуса задачи' });
  }
};

exports.clearCache = async (req, res) => {
  try {
    clearTasksCache();
    res.json({ message: 'Кэш задач успешно очищен' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Ошибка сервера при очистке кэша' });
  }
};

exports.getFullTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Доступ запрещен. Только администраторы могут получать полные данные задачи.' 
      });
    }
    
    const task = await Task.findById(taskId).lean();
    
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    
    res.json({
      ...task,
      isCompleted: false
    });
  } catch (error) {
    console.error('Error fetching full task:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении полных данных задачи' });
  }
};

const extractFunctionName = (template) => {
  const functionMatch = template.match(/function\s+(\w+)\s*\(/);
  if (functionMatch) {
    return functionMatch[1];
  }
  const arrowMatch = template.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
  if (arrowMatch) {
    return arrowMatch[1];
  }
  return null;
};

function deepEqual(a, b) {
  if (a === b) return true;
  
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
    return String(a) === String(b);
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}

module.exports.clearTaskCache = clearTaskCache;
module.exports.clearTasksCache = clearTasksCache;
module.exports.cache = cache;