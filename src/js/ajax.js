function verifyParams(param = '', type = '') {
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'method':
          (param === 'GET' || param === 'POST') ? resolve(true) : reject(new Error('Must provide valid method of either GET or POST'))
          break
        case 'path':
          (param.length && typeof param === 'string') ? resolve(true) : reject(new Error('Must provide valid URL as a string'))
          break
        case 'async':
          (typeof param === 'boolean') ? resolve(true) : reject(new Error('Must provide async as boolean'))
          break
        default:
          resolve(true)
      }
    })
  }
  
function uAjaxWithResponse(method = 'GET', path = '', async = true, data = null, contentType = 'charset=UTF-8') {
    return new Promise((resolve, reject) => {
      verifyParams(method, 'method').catch(err => {
        reject(err)
      })
      verifyParams(path, 'path').catch(err => {
        reject(err)
      })
      verifyParams(async, 'async').catch(err => {
        reject(err)
      })
  
      let req = new XMLHttpRequest()
      req.open(method, path, async)
      req.setRequestHeader('Content-Type', contentType)
  
      // Response received
      req.onload = () => {
        if (req.status >= 200 && req.status < 300) {
          resolve(req.response)
        } else {
          reject(req.statusText)
        }
      }
  
      // Error! Something went wrong
      req.onerror = () => {
        reject(req.statusText)
      }
  
      req.send(data)
    })
  }

let ajaxButton = document.querySelector('.js-ajax-button'),
  usersWrapper = document.querySelector('.js-users'),
  usersTemplateWrapper = document.querySelector('.js-templating-users'),
  usersTemplate = document.getElementById('user-template');

ajaxButton.addEventListener('click', ev => {
    // Loading State Needed
    ajaxButton.classList.add('is-loading');
    ajaxButton.setAttribute('aria-disabled', true);

    // Clear out old data incase needs to be treated as new filters were choosen
    usersWrapper.textContent = '';
    usersTemplateWrapper.innerHTML = '';

    let path = "https://reqres.in/api/users?page=2";
    uAjaxWithResponse("GET", path)
    .then(response => {
        let parseJSONData = JSON.parse(response),
        data = parseJSONData.data;
        renderCreateElementResponse(data);
        renderTemplateResponse(data);
        ajaxButton.classList.remove('is-loading');
        ajaxButton.setAttribute('aria-disabled', false);
    })
})

function renderCreateElementResponse(data) {
  data.forEach(user => {
    let userElement = document.createElement('div');
    userElement.className = 'user';
    userElement.id = 'user-'+user.id;

    let userHeading = document.createElement('h3');
    userHeading.innerText = user.first_name + ' ' + user.last_name;
    userElement.appendChild(userHeading);

    let userEmail = document.createElement('p');
    userEmail.innerText = user.email;
    userElement.appendChild(userEmail);
    
    usersWrapper.appendChild(userElement);
    usersWrapper.parentElement.classList.add('is-active');
  });
}

function renderTemplateResponse(data){
  let usersHTML = ''
  data.forEach(user => {
    //usersTemplateWrapper
    usersHTML += usersTemplate.innerHTML
      .replace(/{{id}}/g, user.id)
      .replace(/{{name}}/g, user.first_name + ' ' + user.last_name)
      .replace(/{{email}}/g, user.email);
  })

  usersTemplateWrapper.innerHTML = usersHTML;
  usersTemplateWrapper.parentElement.classList.add('is-active');
}