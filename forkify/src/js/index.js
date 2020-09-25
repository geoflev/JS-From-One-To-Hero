import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

import { elements, renderLoader, clearLoader } from "./views/base";

//Global State of the Application
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes

const state = {};
/*
SEARCH CONTROLLER
*/

const controlSearch = async () => {
  // Get query from view
  const query = searchView.getInput();
  if (query) {
    // new Search object and add it to state
    state.search = new Search(query);

    //prepare UI for results
    //clear search input
    searchView.clearInput();
    //clear results so if we search again it doesnt place those results below the previous ones
    searchView.clearResults();
    //add loading arrow
    renderLoader(elements.searchRes);

    try {
      //search for recipes
      await state.search.getResults();

      //render results on UI
      //state.search.result -> from Search.js
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Something went wrong with the search..");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  //targets the closest element to the one we click
  //so if we click the arrow, or text or the button itself
  //we get the button
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    //from data-goto class in html
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/*
RECIPE CONTROLLER
*/

const controlRecipe = async () => {
  //window.location is the URL
  //so we get the id from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    //prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected item
    if (state.search) {
      searchView.highlightSelected(id);
    }

    //create Recipe object
    state.recipe = new Recipe(id);
    try {
      //get recipe data and parse ingredients
      await state.recipe.getRecipe();
      console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();
      //calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      //render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// //so we dont lose data on refresh
// window.addEventListener("load", controlRecipe);

//ALTERNATIVE
["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/*
LIST CONTROLLER
*/

const controlList = () => {
  //create new list if there is none yet
  if (!state.list) state.list = new List();

  //add each ingredient to the list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//handle delete and update list item events
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from ui
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/*
LIKE CONTROLLER
*/

const controlLike = () => {
  if (!state.likes) {
    state.likes = new Likes();
  }
  const currentID = state.recipe.id;
  //user has not yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    //add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //toggle like button
    likesView.toggleLikeBtn(true);
    //add like to ui list
    likesView.renderLike(newLike);
  } else {
    //user liked current recipe
    //remove like from the state
    state.likes.deleteLike(currentID);
    //toggle like button
    likesView.toggleLikeBtn(false);
    //add like to ui list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//RESTORE LIKED RECIPES FROM LOCAL STORAGE
window.addEventListener("load", () => {
  state.likes = new Likes();
  //Restore likes
  state.likes.readStorage();
  //toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

//handlind recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    //add ingredients to shop list
    // * child elements
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //like controller
    controlLike();
  }
});

window.l = new List();
