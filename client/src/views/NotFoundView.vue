<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>К сожалению, запрашиваемая страница не существует или была перемещена.</p>
      <router-link to="/" class="btn-home">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  text-align: center;
  padding: 20px;
}

.container {
  max-width: 600px;
}

h1 {
  font-size: 120px;
  color: #4a89dc;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.btn-home {
  display: inline-block;
  background-color: #4a89dc;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-home:hover {
  background-color: #357cd2;
}
</style> 