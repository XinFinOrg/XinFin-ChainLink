const { Requester, Validator } = require('@chainlink/external-adapter')

const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  symbol: ['symbol']
}

const createRequest = (input, callback) => {
  console.log("invput ",input)
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.endpoint || 'single_assets_daily'
  const url = `https://www.vinterapi.com/api/v2/${endpoint}`
  const symbol = 'xdc-usd-p-d'

  const params = {
    symbol
  }

  const config = {
    url,
    params
  }

  // if (process.env.API_KEY) {
    config.headers = {
      Authorization: process.env.API_KEY
    }

  // }

  Requester.request(config, customError)
    .then(response => {
      console.log("response.data",response.data)

      response.data.result = Requester.validateResultNumber(response.data,['value']);
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

module.exports.createRequest = createRequest