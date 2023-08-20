document.addEventListener('DOMContentLoaded', () => {

  //----------PAGE FLIPPING FOR POSTS FUNCTIONALITY---------
  let page = 1
  let posts = document.querySelectorAll('.post')
  let totalPages = Math.ceil(posts.length / 10)
  posts.forEach(post => {
    if (Math.ceil(parseInt(post.getAttribute('data-index'), 10) / 10) != page) {
      post.setAttribute('hidden', 'true')
    }
  })
  let nextBtn = document.querySelector('#next-btn')
  let backBtn = document.querySelector('#back-btn')

  nextBtn.addEventListener('click', () => {
    console.log(page)
    page++
    posts.forEach(post => {
      if (Math.ceil(parseInt(post.getAttribute('data-index'), 10) / 10) != page) {
        post.setAttribute('hidden', '')
      } else {
        post.removeAttribute('hidden')
      }
    })
    backBtn.removeAttribute('disabled')
    if (page >= totalPages) {
      nextBtn.setAttribute('disabled', '')
    }
  })

  backBtn.addEventListener('click', () => {
    page--
    posts.forEach(post => {
      if (Math.ceil(parseInt(post.getAttribute('data-index'), 10) / 10) != page) {
        post.setAttribute('hidden', '')
      } else {
        post.removeAttribute('hidden')
      }
    }) 
    nextBtn.removeAttribute('disabled')
    if (page <= 1) {
      backBtn.setAttribute('disabled', '')
    }
  })
  console.log(totalPages)
  if (totalPages > 1) {
    if (page < totalPages) {
      nextBtn.removeAttribute('disabled')
    } else {
      nextBtn.setAttribute('disabled', '')
    }
    if (page > 1) {
      backBtn.removeAttribute('disabled')
    } else {
      backBtn.setAttribute('disabled', '')
    }
  } else {
    nextBtn.setAttribute('disabled', '')
    backBtn.setAttribute('disabled', '')
  }

  //----------EDIT BUTTON FUNCTIONALITY--------
  let editButtons = document.querySelectorAll('#edit-btn')
  if (editButtons) {
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const postId = button.getAttribute('data-id')
        const postContent = document.querySelector('#post_content_' + postId)
        const postContentDiv = document.querySelector("#post_content_div_" + postId)
        const form = document.createElement('form')
        const textArea = document.createElement('textarea')
        textArea.innerHTML = postContent.innerHTML
        textArea.name='post_content'
        const postIdPass = document.createElement('input')
        postIdPass.type = 'hidden'
        postIdPass.name = 'post_id'
        postIdPass.value = postId
        const submitButton = document.createElement('button')
        submitButton.type = 'submit'
        submitButton.innerHTML = 'submit'
        submitButton.className = 'btn btn-success'
        form.href="{% url 'index' %}"
        form.method ='put'
        form.appendChild(textArea)
        form.appendChild(submitButton)
        form.appendChild(postIdPass)
        postContentDiv.appendChild(form)
        postContent.setAttribute('hidden', '')
        postContentDiv.style.display = 'flex'
        postContentDiv.style.justifyContent = 'center'
        postContentDiv.style.alignItems = 'center'
        postContentDiv.style.alignContent ='center'
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        form.addEventListener('submit', (e) => {
          e.preventDefault()
          const data = {
            post_content:textArea.value,
            post_id:postIdPass.value
          };

          fetch("/", {
            method:'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
          })
          .then(response => {
            form.setAttribute('hidden', '')
            postContent.innerHTML = textArea.value
            postContent.removeAttribute('hidden')
          })
          .catch(error => console.log(error))
        })
      })
    })
  }
})

//-----------------TOGGLE LIKE FUNCTIONALITY-----------
function toggleLike(postId) {
  const button = document.querySelector('#like_button_' + postId)
  likeCount = document.querySelector('#like_count_' + postId)
  let isRemoveLike = button.getAttribute('data-liked') === 'true'
  fetch('/like/', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': document.querySelector('input[name=csrfmiddlewaretoken]').value
    },
    body: JSON.stringify({
      post_id:postId,
      is_remove_like:isRemoveLike
    })
  })
  .then(response => response.json())
  .then(data => {
    let number = likeCount.innerHTML.match(/^\d+/)
    if(data.liked) {
      number = Number(number)
      likeCount.innerHTML = `${(number + 1)} likes`
      button.innerHTML = 'Unlike'
      button.setAttribute('data-liked', 'true')
      button.classList.remove('btn-success')
      button.classList.add('btn-danger')
      
    }
    else {
      likeCount.innerHTML = `${(number - 1)} likes`
      button.innerHTML = 'Like'
      button.setAttribute('data-liked', 'false')
      button.classList.remove('btn-danger')
      button.classList.add('btn-success')
    }
  })
  .catch(error => console.log('Error: ' + error))
}


