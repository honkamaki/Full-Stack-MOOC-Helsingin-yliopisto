// utils/list_helper.js

const dummy = (_blogs) => 1

const totalLikes = (blogs) =>
  blogs.reduce((sum, b) => sum + (b.likes || 0), 0)

/**
 * Palauttaa blogin, jolla on eniten tykkäyksiä.
 * Tyhjä lista -> null.
 * Jos monta maksimiarvoa, palauttaa niistä ensimmäisen.
 */
const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null
  return blogs.reduce((fav, blog) =>
    blog.likes > fav.likes ? blog : fav
  )
}

module.exports = { dummy, totalLikes, favoriteBlog }
