// TODO: Copy the fetch stuff over from the iOS function

function fetch(url, options) {
	options = options || {};
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		const keys = [];
		const all = [];
		const headers = {};

		console.log('[FETCH] We in this bitch');

		const response = () => ({
			ok: (request.status / 100 | 0) == 2,		// 200-299
			statusText: request.statusText,
			status: request.status,
			url: request.responseURL,
			text: () => {
				console.log(`[FETCH] Text response do be firing: ${request.responseText}`);
				return Promise.resolve(request.responseText);
			},
			json: () => {
				console.log(`[FETCH] JSON response do be firing: ${request.responseText}`);
				const isError = (request.status / 100 | 0) == 2;
				// TODO: review this handle because it may discard \n from json attributes
				try {
					// console.log('RESPONSE TEXT IN FETCH: ' + request.responseText);
					return Promise.resolve({
						'data': request.responseText,
						'status': request.status ?? 500,
						'headers': request.headers ?? nil,
					});
				} catch (e) {
					// console.log('ERROR on fetch parsing JSON: ' + e.message);
					return Promise.resolve(request.responseText);
				}
			},
			blob: () => Promise.resolve(new Blob([request.response])),
			clone: response,
			headers: {
				keys: () => keys,
				entries: () => all,
				get: n => headers[n.toLowerCase()],
				has: n => n.toLowerCase() in headers
			}
		});

		request.open(options.method || 'get', url, true);

		request.onload = () => {
			request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
				keys.push(key = key.toLowerCase());
				all.push([key, value]);
				headers[key] = headers[key] ? `${headers[key]},${value}` : value;
			});
			resolve(response());
		};

		request.onerror = reject;

		request.withCredentials = options.credentials == 'include';

		if (options.headers) {
			if (options.headers.constructor.name == 'Object') {
				for (const i in options.headers) {
					request.setRequestHeader(i, options.headers[i]);
				}
			} else { // if it is some Headers pollyfill, the way to iterate is through for of
				for (const header of options.headers) {
					request.setRequestHeader(header[0], header[1]);
				}
			}
		}

		request.send(options.body || null);
	});
}