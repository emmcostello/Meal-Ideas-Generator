/* ------------------------------------
// 1. Selecting my elements (querySelector)
//querySelector(...) finds an element in the HTML and stores it in a variable.

I want to control the button, the input, the status text, the results area, and the list
I’m saving references to the key HTML elements so I can update them later without searching the page repeatedly.*/

const searchSubmitButton = document.querySelector(".search-submit");
const ingredientInput = document.querySelector("#ingredient");

const statusElement = document.querySelector(".status");
const resultsSection = document.querySelector(".results");
const mealListElement = document.querySelector(".meal-list");
const dietSelect = document.querySelector("#diet");

/*2. adding my event listeners, they wait for the user to interact so they can run the function */

searchSubmitButton.addEventListener("click", handleMealSearchClick);

ingredientInput.addEventListener("input", handleIngredientInput);

/*this is a new event listener ive added for the meal card ingred details*/
mealListElement.addEventListener("click", handleMealCardClick);

/*functions- these are my event handlers*/

function handleMealSearchClick(event) {
  // stop the form submission refreshing the page, which is the default
  // behaviour when someone submits an HTML form
  event.preventDefault();
  // extract user-entered values for ingredient and diet

  const ingredient = ingredientInput.value.trim(); //removes the spaces from what my user has typed
  const diet = dietSelect.value;
  /* validation if it’s empty add an error class (for styling) show a status message hide results return stops the function (early exit)*/
  if (ingredient === "") {
    ingredientInput.classList.add("error");
    showStatus("Please enter an ingredient.");
    hideResults();
    return;
  }

  //if it is a valid entry then remove the error
  ingredientInput.classList.remove("error");

  // and if valid entry also call the API using the user-entered ingredient
  fetchMealsByIngredient(ingredient, diet);
}

function handleIngredientInput() {
  // user feedback: remove error styling once they start typing
  if (ingredientInput.value.trim() !== "") {
    ingredientInput.classList.remove("error");
    hideStatus();
  }
}

function handleMealCardClick(event) {
  const clickedCard = event.target.closest(".meal-card");

  if (!clickedCard) {
    return;
  }

  clickedCard.classList.toggle("is-flipped");

  const mealId = clickedCard.dataset.mealid;
  fetchMealDetailsById(mealId, clickedCard);
}

/*API stuff*/

async function fetchMealsByIngredient(ingredient) {
  showStatus("Loading meals..."); //1 show status in case it takes a while
  hideResults(); //2 this hides the old results

  const url =
    "https://www.themealdb.com/api/json/v1/1/filter.php?i=" +
    encodeURIComponent(ingredient); //3 this handles weird characters

  try {
    const response = await fetch(url);
    const data = await response.json();
    /*4 if there are no results in the data*/

    if (!data.meals) {
      showStatus("Oh Falafel! No meals found for that ingredient.");
      return;
    }
    /*5 this loads the cards*/

    renderMeals(data.meals);
    hideStatus();
    showResults();
  } catch (error) {
    console.error(error);
    showStatus("Oh Falafel! Something went wrong. Please try again.");
  }
}

async function fetchMealDetailsById(mealId, clickedCard) {
  showStatus("Loading ingredients...");

  const url =
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" +
    encodeURIComponent(mealId);

  try {
    const response = await fetch(url);
    const data = await response.json();

    const meal = data.meals && data.meals[0];

    if (!meal) {
      showStatus("Oh Falafel! Couldn't load that meal.");
      return;
    }

    const ingredients = getIngredientsFromMeal(meal);
    toggleIngredientsOnCard(clickedCard, ingredients);

    hideStatus();
  } catch (error) {
    console.error(error);
    showStatus("Oh Falafel! Something went wrong loading ingredients.");
  }
}

function getIngredientsFromMeal(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];

    if (ingredient && ingredient.trim() !== "") {
      const line = (measure || "").trim() + " " + ingredient.trim();
      ingredients.push(line.trim());
    }
  }

  return ingredients;
}

// ------------------------------------
// UI showing and hiding results
// ------------------------------------

/*make it visible*/
function showStatus(message) {
  statusElement.textContent = message;
  statusElement.classList.remove("hidden");
}
/*hide it*/
function hideStatus() {
  statusElement.textContent = "";
  statusElement.classList.add("hidden");
}

function showResults() {
  resultsSection.classList.remove("hidden");
}

function hideResults() {
  resultsSection.classList.add("hidden");
}

function toggleIngredientsOnCard(card, ingredients) {
  // if ingredients already exist, toggle visibility
  const existing = card.querySelector(".ingredients");

  if (existing) {
    existing.classList.toggle("hidden");
    return;
  }

  // create container
  const container = document.createElement("div");

  // create heading
  const heading = document.createElement("h4");
  heading.textContent = "Ingredients";

  // otherwise create it the first time
  const list = document.createElement("ul");
  list.classList.add("ingredients");

  ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  // append heading + list
  container.appendChild(heading);
  container.appendChild(list);

  const back = card.querySelector(".meal-card-back");
  back.innerHTML = "";
  back.appendChild(container);
}

// ------------------------------------
// Render meals- this takes the array of meals and builds html for each one
// ------------------------------------

function renderMeals(meals) {
  mealListElement.innerHTML = "";

  meals.forEach((meal) => {
    const card = document.createElement("article");
    card.classList.add("meal-card");
    card.dataset.mealid = meal.idMeal;

    const inner = document.createElement("div");
    inner.classList.add("meal-card-inner");

    const front = document.createElement("div");
    front.classList.add("meal-card-front");

    const back = document.createElement("div");
    back.classList.add("meal-card-back");

    // FRONT
    const img = document.createElement("img");
    img.src = meal.strMealThumb;

    const title = document.createElement("h3");
    title.textContent = meal.strMeal;

    front.appendChild(img);
    front.appendChild(title);

    // BACK
    back.textContent = "Loading...";

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    mealListElement.appendChild(card);
  });
}
