const SHOWN__ITEMS_NUMBER = 5;
const searchInput = document.querySelector(".search-input");
const autocompleteList = document.querySelector(".autocomplete-list");
const repositoryList = document.querySelector(".repository-list");
const savedDataId = [];

//получить данные с сервера
const getResource = async (value) => {
  const apiBase = `https://api.github.com/search/repositories?q=`;
  
  /*вернуть пустой массив, если поле ввода пустое*/
  if (!value) {
    return [];
  }

  const res = await fetch(`${apiBase}${value}`);
  /*вернуть пустой массив, если количество запросов превышено*/
  if (res.status === 403) {
    return [];
  }

  const { items } = await res.json();

  return items;
}



/*удалить элементы автокомплита*/
const removeAutocompleteItem = (container) => {
  let length = container.children.length;
    for(let i = length; i != 0; i--) {
      container.removeChild(container.children[i - 1]);
    }
}

const debounce = (fn, debounceTime) => {
  let timeoutID;
  
  return function(...args) {
      if (timeoutID) {
          clearTimeout(timeoutID);
      }
      
      timeoutID = setTimeout(() => {
         fn.apply(null, args ).then((items) => {
           /*очистить автокомплит предыдущего запроса, 
            если результат, пришедший с сервера === [],
            или поле ввода пустое или количество запросов превышено*/
            if (!items.length) {
             removeAutocompleteItem(autocompleteList);
             return;
           }

          const shownItems = items.slice(0, SHOWN__ITEMS_NUMBER);

          if (searchInput.value) {
            showAutocompleteList(shownItems);
          }
        });
         
      }, debounceTime);
  };
};

const debounceData = debounce(getResource, 200);


//отобразить автокомлит
const showAutocompleteList = (data) => {
  /*очистить автокомплит предыдущего запроса*/
  if (autocompleteList.children.length) {
    removeAutocompleteItem(autocompleteList);
  }
  
  for (let i = 0; i < data.length; i++) {
    const {name} = data[i];

    const isDataSaved = savedDataId.some(id => id === data[i].id);
    const oldItem = repositoryList.querySelector(`#${name}`);

  
    if (oldItem) {
      const newItem = createElement(createRepositoryCardTemplate(data[i]));
      repositoryList.replaceChild(newItem, oldItem);

      const repositoryItem = repositoryList.querySelector(`#${name}`);
      const removeButton = repositoryItem.querySelector(".remove-button");
    
      removeButton.addEventListener("click", () => {
        button.disabled = false;
        repositoryList.removeChild(repositoryItem);
      });
    }

    render(autocompleteList, createElement(createAutocompleteItem(name, isDataSaved)), "afterbegin");

    const button = document.querySelector(".autocomplete-item").querySelector(".autocomplete-button");

    button.addEventListener("click", () => {
      button.disabled = true;
      savedDataId.push(data[i].id);
      render(
        repositoryList,
        createElement(createRepositoryCardTemplate(data[i])),
        "beforeend"
      );

      searchInput.value = "";
      
      const repositoryItem = repositoryList.querySelector(`#${name}`);
      const removeButton = repositoryItem.querySelector(".remove-button");
    
      removeButton.addEventListener("click", () => {
        button.disabled = false;
        repositoryList.removeChild(repositoryItem);
      });
    });
  }
};


//создать шаблон для блока с информацией о добавленном репозитории
const createRepositoryCardTemplate = (repository) => {
  const {
    name,
    owner: { login },
    stargazers_count,
  } = repository;
  return `<li class="repository-list__item" id = ${name}>
            <div class="repository-list__container">
            <p>Name: ${name} </p>
            <p>Owner: ${login} </p>
            <p>Stars: ${stargazers_count}</p>
            </div>
          <button type="button" class="remove-button"></button>
     </li>`;
};

//создать шаблон для элемента автокомплита
const createAutocompleteItem = (name, isDataSaved) => {
  return `<li class="autocomplete-item">
       <button type="button" class="autocomplete-button" ${isDataSaved ? "disabled": ""}>${name}</button>
     </li>`;
};


//отрисовать DOM-узел
const render = (container, element, place) => {
  switch (place) {
    case "afterbegin":
      container.prepend(element);
      break;
    case "beforeend":
      container.append(element);
      break;
  }
};

//создать DOM-узел
const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;

  return newElement.firstChild;
};


searchInput.addEventListener("input", () => {
  debounceData(searchInput.value);
});
