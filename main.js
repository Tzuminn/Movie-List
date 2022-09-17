const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []   //存放搜尋的電影

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 只負責把data render出來
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //我們需要title和image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie"data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  // 印出電影清單
  dataPanel.innerHTML = rawHTML
}
// 串接電影詳細資料
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">`
  })
}
// 渲染頁碼
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //無條件進位(數量/一頁12個)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 分頁用函式
function getMovieByPage(page) {
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  // ...

  const data = filteredMovies.length ? filteredMovies : movies
  //↑ filteredMovies有長度嗎?有的話就是有搜尋 就顯示filteredMovies，反之就顯示movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function addToFavorite(id) {
  //取出喜歡的電影到list  要轉回JS
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []   //左 || 右  會回傳值是true的，左邊優先
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經再收藏清單中!')
  }

  list.push(movie)
  // const jsonString = JSON.stringify(list)                    //用JSON.stringify把資料轉成JSON字串
  // console.log('jason string : ', jsonString)
  // console.log('jason object : ', JSON.parse(jsonString))     //再用JSON.parse把JSON字串轉回JS
  // console.log(list)                                          //檢查是否有加入成功
  localStorage.setItem('favoriteMovies', JSON.stringify(list))  //localStorage參數只能放字串，所以要先轉字串
}


// 監聽點擊按鈕執行->串接電影詳細資料函式
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 綁一個收藏電影功能    
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽換頁
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))
})




// 搜尋功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()   //因為正常送出資料會重整頁面，這行是請瀏覽器不要做出預設的動作，把控制權給JS做。
  // console.log(searchInput.value) //先用這行確認input的值是否有抓到
  const keyword = searchInput.value.trim().toLowerCase() //toLowerCase用來把搜尋字母全部變小寫(希望不管打大小寫都找的到關鍵字)

  // if (!keyword.length) {                            //驗證用
  //   return alert('Please enter a valid string')
  // }

  // 印出搜尋的電影 方法一 : 迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 印出搜尋的電影 方法二 : filter()過濾器  //filter是陣列用的，會把裡面的元素都丟進條件函式檢查，成功就保留
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  // 沒有輸入就回到主頁  有輸入錯誤就顯示找不到關鍵字
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))
})


axios.get(INDEX_URL).then((response) => {
  // Array(80)
  // 把movie放入movies陣列裡 : 方法一 => 使用for迴圈
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  // 把movie放入movies陣列裡 : 方法二 => 展開運算 (+...)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMovieByPage(1))
})

