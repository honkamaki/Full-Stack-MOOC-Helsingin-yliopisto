const baseStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  margin: '10px 0',
}

const Notification = ({ type, message }) => {
  if (!message) return null
  const style = {
    ...baseStyle,
    color: type === 'error' ? '#a10000' : '#0a4',
    background: type === 'error' ? '#ffe6e6' : '#eaffea',
    border: `1px solid ${type === 'error' ? '#a10000' : '#0a4'}`
  }
  return <div style={style}>{message}</div>
}

export default Notification
