const { describe, test } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// 4.3
describe('dummy', () => {
  test('returns one', () => {
    const result = listHelper.dummy([])
    assert.strictEqual(result, 1)
  })
})

// 4.4
describe('total likes', () => {
  const empty = []
  const one = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5, __v: 0
    }
  ]
  const many = [
    { _id: 'a', title: 'React patterns', author: 'Michael Chan', url: '#', likes: 7, __v: 0 },
    { _id: 'b', title: 'Go To', author: 'E. W. Dijkstra', url: '#', likes: 5, __v: 0 },
    { _id: 'c', title: 'Canonical string reduction', author: 'E. W. Dijkstra', url: '#', likes: 12, __v: 0 },
  ]

  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes(empty), 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    assert.strictEqual(listHelper.totalLikes(one), 5)
  })

  test('of a bigger list is calculated right', () => {
    assert.strictEqual(listHelper.totalLikes(many), 24)
  })
})

// 4.5
describe('favorite blog', () => {
  const blogs = [
    { _id: '1', title: 'React patterns', author: 'Michael Chan', url: '#', likes: 7, __v: 0 },
    { _id: '2', title: 'Go To', author: 'E. W. Dijkstra', url: '#', likes: 5, __v: 0 },
    { _id: '3', title: 'Canonical string reduction', author: 'E. W. Dijkstra', url: '#', likes: 12, __v: 0 },
  ]

  test('returns the blog with most likes', () => {
    const expected = blogs[2] // 12 likes
    assert.deepStrictEqual(listHelper.favoriteBlog(blogs), expected)
  })

  test('of empty list is null', () => {
    assert.strictEqual(listHelper.favoriteBlog([]), null)
  })
})
