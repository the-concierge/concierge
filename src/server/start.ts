import server from './'

export default function start() {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3141
    server.listen(port, err => {
      if (err) {
        return reject(err)
      }
      resolve(port)
    })
  })
}