export type Body = {
  repository: string
  name: string
  key: string
  label: string
  dockerfile: string
}

export default function validate(body: Body) {
  const errors = Object.keys(body)
    .reduce((list, key) => {
      if (key === 'id') { return list }

      const value = body[key]
      if (typeof value !== 'string') {
        list.push(`${key} is invalid`)
      }
      return list
    }, [])

  const repo = body.repository || ''
  const name = body.name || ''
  const label = body.label || ''

  if (!repo.length) {
    errors.push('Invalid repository name')
  }

  if (!name.length) {
    errors.push('Invalid application name')
  }

  if (!label.length) {
    errors.push('Invalid application label')
  }

  return errors
}
