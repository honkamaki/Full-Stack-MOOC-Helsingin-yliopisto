// utils/list_helper.js

// 4.3
const dummy = (_blogs) => 1

// 4.4
const totalLikes = (blogs) =>
  blogs.reduce((sum, b) => sum + (b.likes || 0), 0)

// 4.5
const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null
  return blogs.reduce((fav, blog) => (blog.likes > fav.likes ? blog : fav))
}

module.exports = { dummy, totalLikes, favoriteBlog }
