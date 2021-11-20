const express = require('express')
const got = require('got')

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send('<h1>Hello, this is an app that works with Steam API! Add inventory/{steamID} route to your URL to look at the user\'s inventory.</h1>')
})

app.get('/inventory/:steamID', async (req, res) => {
  let steamResponse, modifiedData

  try {
    steamResponse = await got.get(`https://steamcommunity.com/inventory/${req.params.steamID}/730/2?l=en`, {
      responseType: 'json'
    })
  } catch (error) {
    console.log(error)
  }

  modifiedData = steamResponse.body.descriptions.map(el => {
    return { market_hash_name: el.market_hash_name, tradable: el.tradable }
  })

  if (req.query && !req.query.tradable) {                       // для запроса в виде /inventory/{steamID}
    modifiedData = modifiedData
      .sort((a, b) => a.market_hash_name[0] > b.market_hash_name[0] ? 1 : -1)
      .sort((a, b) => {
        if (a.market_hash_name[0] === b.market_hash_name[0]) return a.tradable > b.tradable ? -1 : 1
      })
  } else if (req.query && req.query.tradable === 'true') {      // для запроса в виде /inventory/{steamID}?tradable=true
    modifiedData = modifiedData
      .filter(el => el.tradable === 1)
      .sort((a, b) => a.market_hash_name[0] > b.market_hash_name[0] ? 1 : -1)
  } else if (req.query && req.query.tradable === 'false') {     // для запроса в виде /inventory/{steamID}?tradable=false
    modifiedData = modifiedData
      .filter(el => el.tradable === 0)
      .sort((a, b) => a.market_hash_name[0] > b.market_hash_name[0] ? 1 : -1)
  }

  console.log(modifiedData)
  res.send(modifiedData)
})

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})
