import { defineEventHandler, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 200)
  return { status: 200, message: 'Logout successful' }
})
