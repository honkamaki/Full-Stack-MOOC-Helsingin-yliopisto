// utils/list_helper.js

/**
 * 4.3 dummy:
 * Palauttaa aina 1 riippumatta parametrin sisällöstä.
 */
const dummy = (_blogs) => 1

/**
 * 4.4 totalLikes:
 * Laskee yhteen blogien like-määrät.
 */
const totalLikes = (blogs) =>
  blogs.reduce((sum, b) => sum + (b.likes || 0), 0)

/**
 * 4.5 favoriteBlog:
 * Palauttaa blogin, jolla on eniten tykkäyksiä.
 * Jos lista on tyhjä → palauttaa null.
 */
const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null
  return blogs.reduce((fav, b) => (b.likes > fav.likes ? b : fav), blogs[0])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
