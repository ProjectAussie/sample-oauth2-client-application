var express = require('express')
var request = require('request')

var embark_domain = 'https://embarkvet.com'

// This should be the redirect_uri you've entered at https://embarkvet.com/members/manage-client-app
var redirect_uri = 'http://localhost:3000/redirect-from-embark-oauth'

// get your client application's client_id and client_secret from https://embarkvet.com/members/manage-client-app
var client_id = 'XXXXXX'
var client_secret = 'XXXXXX'

var token_info = null

var app = express()

app.get('/', function (req, res) {
	res.send(`<a href="${embark_domain}/members/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}">give test-client-app permission to read your embark data</a>`)
})

app.get('/redirect-from-embark-oauth', function (req, res) {
	console.log('returning from embark oauth')
	console.log('making post to /oauth/token to get token info')
	request.post(`${embark_domain}/oauth/token`, { form:
		{
			grant_type: 'authorization_code',
			client_id,
			client_secret,
			redirect_uri,
			code: req.query.code
		}
	}, function (err, response, data) {
		console.log('err:')
		console.log(err)
		console.log('data:')
		console.log(data)
		console.log('persist the data for this client-application user')
		token_info = JSON.parse(data)
		res.send('ok, you have given this application access to your embark data<br /><a href="/show-embark-data">show my embark data</a>')
	})
})

app.get('/show-embark-data', function (req, res) {
	console.log('requesting with token:')
	console.log(token_info)
	request(`${embark_domain}/api/graphql`, {
		method: 'POST',
		json: true,
		body: {
			query: '{\ngetTokenUser {\n id\n pets {\n petNum\n type\n name\n handle\n }\n}\n}', // just a sample query, explore more options at https://embarkvet.com/api/graphiql
			variables: null,
			operationName: null
		},
		headers: {
			Authorization: 'Bearer ' + token_info.access_token
		}
	}, function (err, response, data) {
		console.log('err:')
		console.log(err)
		console.log('data:')
		console.log(data)
		res.send(JSON.stringify(data))
	})
})

app.listen(3000)
console.log('listening on port 3000')
