const Course = ({ course }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Header name={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}

const Header = ({ name }) => <h2>{name}</h2>

const Content = ({ parts }) => (
  <ul>
    {parts.map(part => (
      <Part key={part.id} name={part.name} exercises={part.exercises} />
    ))}
  </ul>
)

const Part = ({ name, exercises }) => (
  <li>
    {name} {exercises} exercises
  </li>
)

const Total = ({ parts }) => {
  const total = parts.reduce((sum, part) => sum + part.exercises, 0)
  return <p><strong>Total of {total} exercises</strong></p>
}

export default Course
