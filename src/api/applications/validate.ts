export type Body = {
  repository: string
  name: string
  key: string
}

export default function validate(body: Body) {
  return Object.keys(body)
    .reduce((list, key) => {
      const value = body[key]
      if (typeof value !== 'string') {
        list.push(`${key} is invalid`)
      }
      return list
    }, [])
}
