export type Body = {
  repository: string
  name: string
  key: string
}

export default function validate(body: Body) {
  const errors = Object.keys(body)
    .reduce((list, key) => {
      const value = body[key]
      if (typeof value !== 'string') {
        list.push(`${key} is invalid`)
      }
      return list
    }, [])

  const repo = body.repository || ''
  const name = body.name || ''

  if (!repo.length) {
    errors.push('Invalid repository name')
  }

  if (!name.length) {
    errors.push('Invalid application name')
  }

  return errors
}
