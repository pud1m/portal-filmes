// ===== Constantes
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMGNiNjdhODk0NDI1NGQxNWYwZjRiMDRjODk1ZGE1ZiIsInN1YiI6IjVmYzZjMjg2YzJiOWRmMDA0MTQ3NjU4MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hiY_VvR48KQypeK5XGr-_hiyzLA9Sz3FeHm_5kr2Cmw';
const API_ROOT_URL = 'https://api.themoviedb.org/3/';
const DEFAULT_PARAMS = 'language=pt-BR';

const DEFAULT_HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json;charset=utf-8'
}


// ===== Executor do código inicial
$(document).ready(function() {
  getTrending();
  createSearchListener();
});

// ===== Injetores de conteúdo
const getMovieCard = (data) => {
  return `
    <div class="card m-2" style="width: 18rem;">
      <img class="card-img-top ${data.poster_path === null ? 'd-none' : ''}" src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
      <div class="card-image-filler ${data.poster_path !== null ? 'd-none' : ''}"><span>Sem imagem</span></div>
      <div class="card-body d-flex flex-column justify-content-between">
        <h5 class="card-title">${data.title}</h5>
        <p class="card-text">Nota média: ${data.vote_average}</p>
        <p class="card-text">Popularidade: ${data.popularity}</p>
        <a href="#" class="btn btn-red btn-movie-card" data-movie-id="${data.id}">Ver mais</a>
      </div>
    </div>
  `
};

const setModalContent = (data) => {
  const imageNode = document.querySelector('#modalImage');

  document.querySelector('#modalTitle').innerHTML = data.title;
  document.querySelector('#modalSinopse').innerHTML = data.overview;
  document.querySelector('#modalDuration').innerHTML = `${data.runtime} min.`;
  document.querySelector('#modalSite').href = data.homepage;
  imageNode.src =`https://image.tmdb.org/t/p/w500${data.backdrop_path}`;

  data.backdrop_path === null ? imageNode.classList.add('d-none') : imageNode.classList.remove('d-none');

  const firstGenre = data.genres.pop();
  let genreList = firstGenre.name;
  data.genres.forEach(genre => {
    genreList += `, ${genre.name}`;
  })
  document.querySelector('#modalGenero').innerHTML = genreList + '.';
};


// ===== Listeners
const createCardListeners = () => {
  const cardBtnList = document.querySelectorAll('.btn-movie-card');

  for (const btnNode of cardBtnList) {
	  btnNode.addEventListener('click', ({target}) => {
      getSingleMovie(target.dataset.movieId);
    })
	}
};

const createSearchListener = () => {
  document.querySelector('#searchBtnClick').addEventListener('click', () => {
    const queryString = document.querySelector('#searchInput');
    if(queryString.value.length < 3) {
      window.alert('Você precisa inserir pelo menos 3 caracteres para buscar');
    }
    else {
      getSearchResults(queryString.value);
    }
  });
};


// ===== Loader
const switchLoader = (loaderActive) => {
  const loaderNode = document.querySelector('.loader');
  loaderActive ? loaderNode.classList.remove('-off') : loaderNode.classList.add('-off');
};


// ===== Fetchers
const getTrending = async () => {
  switchLoader(true);
  await fetch(`${API_ROOT_URL}trending/movie/week?${DEFAULT_PARAMS}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS
  })
    .then(async response => {
      data = await response.json(); 
      const movieListNode = document.querySelector('div.movie-list');
      
      let movieCardString = '';
      data.results.forEach(movie => {
        movieCardString += getMovieCard(movie);
      });
  
      movieListNode.innerHTML = movieCardString;
      createCardListeners();
    })
    .catch(err => {
      console.log(err);
    });

  switchLoader(false);
};

const getSingleMovie = async (movieId) => {
  switchLoader(true);
  await fetch(`${API_ROOT_URL}movie/${movieId}?${DEFAULT_PARAMS}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS
  })
    .then(async response => {
      isSuccess = true;
      data = await response.json(); 
      
      setModalContent(data);
      $('#movieDetailsModal').modal('show');
    })
    .catch(err => {
      console.log(err);
    });

    switchLoader(false);
};

const getSearchResults = async (queryString) => {
  switchLoader(true);
  await fetch(`${API_ROOT_URL}search/movie/?query=${queryString}&${DEFAULT_PARAMS}&page=1&include_adult=false`, {
    method: 'GET',
    headers: DEFAULT_HEADERS
  })
    .then(async response => {
      data = await response.json(); 
      const movieListNode = document.querySelector('div.movie-list');
      
      let movieCardString;
      if(data.total_results > 20) {
        movieCardString = `
          <div class="w-100 text-center mb-3">
            <strong>${data.total_results} resultados encontrados, porém exibindo apenas 20. Refine sua busca para encontrar algo mais específico.</strong>
            <br>Você também pode voltar para a lista dos mais populares <a href="/">clicando aqui.</a>
          </div>
          `;
      }
      else{
        movieCardString = `
          <div class="w-100 text-center mb-3">
            <strong>Exibindo todos os ${data.total_results} resultados encontrados.</strong>
            <br>Você também pode voltar para a lista dos mais populares <a href="/">clicando aqui.</a>
          </div>
          `;
      }

      let resultsFound = false;
      data.results.forEach(movie => {
        resultsFound = true;
        movieCardString += getMovieCard(movie);
      });

      if(!resultsFound) {
        movieListNode.innerHTML = `
        <div class="w-100 text-center font-weight-bold">Nada foi encontrado. Tente novamente ou volte para a home <a href="/">clicando aqui.</a></div>
        `;
      }
      else {
        movieListNode.innerHTML = movieCardString;
        createCardListeners();
      }
    })
    .catch(err => {
      console.log(err);
    });

    switchLoader(false);
};
