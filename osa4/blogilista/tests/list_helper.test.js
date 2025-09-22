// tests/list_helper.test.js
const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// 4.3 dummy
test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

// 4.4 totalLikes
describe('total likes', () => {
  const listWithNoBlogs = []

  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithManyBlogs = [
    { _id: 'a', title: 'First', author: 'Ada', url: '#', likes: 7, __v: 0 },
    { _id: 'b', title: 'Second', author: 'Linus', url: '#', likes: 5, __v: 0 },
    { _id: 'c', title: 'Third', author: 'Grace', url: '#', likes: 12, __v: 0 },
    { _id: 'd', title: 'Zero likes', author: 'Anon', url: '#', likes: 0, __v: 0 },
  ]

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(listWithNoBlogs)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    assert.strictEqual(result, 24) // 7 + 5 + 12 + 0
  })
})

// 4.5 favoriteBlog
describe('favorite blog', () => {
  const noBlogs = []

  const oneBlog = [
    { _id: '1', title: 'Single', author: 'Only One', url: '#', likes: 42, __v: 0 },
  ]

  const manyBlogs = [
    { _id: 'a', title: 'First', author: 'Ada', url: '#', likes: 7, __v: 0 },
    { _id: 'b', title: 'Second', author: 'Linus', url: '#', likes: 5, __v: 0 },
    { _id: 'c', title: 'Third', author: 'Grace', url: '#', likes: 12, __v: 0 },
    { _id: 'd', title: 'Tie', author: 'Anon', url: '#', likes: 12, __v: 0 },
  ]

  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog(noBlogs)
    assert.strictEqual(result, null)
  })

  test('when list has only one blog equals that blog', () => {
    const result = listHelper.favoriteBlog(oneBlog)
    assert.deepStrictEqual(result, oneBlog[0])
  })

  test('of a bigger list is the one with most likes', () => {
    const result = listHelper.favoriteBlog(manyBlogs)
    const expected = {
      _id: 'c',
      title: 'Third',
      author: 'Grace',
      url: '#',
      likes: 12,
      __v: 0,
    }
    assert.deepStrictEqual(result, expected)
  })
})
