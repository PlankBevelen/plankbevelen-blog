export default defineNuxtPlugin(() => {
  if (import.meta.env.PROD) {
    console.log = () => {}
  }
})
