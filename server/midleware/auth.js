export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const user = await login(username, password)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    })
  }
  setCookie(event, 'token', user.token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  })
  return user
})