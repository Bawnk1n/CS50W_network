document.addEventListener('DOMContentLoaded', () => {
  let followBtn = document.getElementById('follow-btn')
  if (followBtn) {
    followBtn.addEventListener('click', () => follow())
  }
  
})


function follow() {
  let followBtn = document.getElementById('follow-btn')
  let isFollowed = followBtn.getAttribute('data-followed') === 'true'
  let user = followBtn.getAttribute('data-user')
  let followerCountDiv = document.getElementById('follower-count')
  let followerCount = followerCountDiv.innerHTML.match(/\d+/)
  followerCount = Number(followerCount[0])

  if (isFollowed) {
    fetch('follow/', {
      method:'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('input[name=csrfmiddlewaretoken]').value
      },
      body:JSON.stringify({
        user:user,
        isFollowed:isFollowed
      })
    })
    followBtn.setAttribute('data-followed', 'false') 
    followBtn.innerHTML = 'Follow'
    followerCountDiv.innerHTML = 'Followers: ' + (followerCount - 1)
  } else {
    console.log('test js')
    fetch('follow/', {
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('input[name=csrfmiddlewaretoken]').value
      },
      body : JSON.stringify({
        user:user,
        isFollowed:isFollowed
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    followBtn.setAttribute('data-followed', 'true') 
    followBtn.innerHTML = 'Unfollow'
    followerCountDiv.innerHTML = 'Followers: ' + (followerCount + 1)
  }
}