addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return JSON.stringify(await request.json());
  } else if (contentType.includes('application/text')) {
    return request.text();
  } else if (contentType.includes('text/html')) {
    return request.text();
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    const body = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return JSON.stringify(body);
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return 'a file';
  }
}

async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes('application/text')) {
    return response.text();
  } else if (contentType.includes('text/html')) {
    return response.text();
  } else {
    return response.text();
  }
}

const urlMapper = {
    "https://services-staging.ibo.com/ecms/v1/empl21": "https://<region>-<projectid>.cloudfunctions.net/ecms-wrapper"
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const apiURL = urlMapper[url.href]
  const reqBody = await readRequestBody(request);
  
   const init = {
    body: reqBody,
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  };

  const response = await fetch(apiURL, init);
  const results = await gatherResponse(response);
  return new Response(results, init);
}
