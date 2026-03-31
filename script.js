/*
Mapping from MealDB Categories to TheCocktailDB drink ingredient
You can customize or expand this object to suit your needs.
*/
const mealCategoryToCocktailIngredient = {
  Beef: "whiskey",
  Chicken: "gin",
  Dessert: "amaretto",
  Lamb: "vodka",
  Miscellaneous: "vodka",
  Pasta: "tequila",
  Pork: "tequila",
  Seafood: "rum",
  Side: "brandy",
  Starter: "rum",
  Vegetarian: "gin",
  Breakfast: "vodka",
  Goat: "whiskey",
  Vegan: "rum",
  // Add more if needed; otherwise default to something like 'cola'
};

/*
    2) Main Initialization Function
      Called on page load to start all the requests:
      - Fetch random meal
      - Display meal
      - Map meal category to spirit
      - Fetch matching (or random) cocktail
      - Display cocktail
*/

function init() {
  fetchRandomMeal()
    .then((meal) => {
      displayMealData(meal);
      const spirit = mapMealCategoryToDrinkIngredient(meal.strCategory);
      return fetchCocktailByDrinkIngredient(spirit);
    })
    .then((cocktail) => {
      displayCocktailData(cocktail);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/*
  Fetch a Random Meal from TheMealDB
  Returns a Promise that resolves with the meal object
 */

function fetchRandomMeal() {
  return fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Kunne ikke hente meal");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data.meals[0];
    });
}

/*
Display Meal Data in the DOM
Receives a meal object with fields like:
  strMeal, strMealThumb, strCategory, strInstructions,
  strIngredientX, strMeasureX, etc.
*/

function displayMealData(meal) {
  const mealContainer = document.getElementById("meal-container");

  let ingredientsHTML = "";

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredientsHTML += `<li>${ingredient} - ${measure ? measure : ""}</li>`;
    }
  }

/*
Convert MealDB Category to a TheCocktailDB Spirit
Looks up category in our map, or defaults to 'cola'
*/
function mapMealCategoryToDrinkIngredient(category) {
  if (!category) return "cola";
  return mealCategoryToCocktailIngredient[category] || "cola";
}
  mealContainer.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" width="300">
    <p><strong>Category:</strong> ${meal.strCategory}</p>
    
    <h3>Ingredients</h3>
    <ul>
      ${ingredientsHTML}
    </ul>

    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
  `;
}
/*
Fetch a Cocktail Using a Spirit from TheCocktailDB
Returns Promise that resolves to cocktail object
We call https://www.thecocktaildb.com/api/json/v1/1/search.php?s=DRINK_INGREDIENT to get a list of cocktails
Don't forget encodeURIComponent()
If no cocktails found, fetch random
*/

function fetchCocktailByDrinkIngredient(drinkIngredient) {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(drinkIngredient)}`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.drinks) {
        return fetchRandomCocktail();
      }

      const randomDrink =
        data.drinks[Math.floor(Math.random() * data.drinks.length)];

      return fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${randomDrink.idDrink}`
      )
        .then((res) => res.json())
        .then((data) => data.drinks[0]);
    });
}

/*
Fetch a Random Cocktail (backup in case nothing is found by the search)
Returns a Promise that resolves to cocktail object
*/
function fetchRandomCocktail() {
  return fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then((res) => res.json())
    .then((data) => data.drinks[0]);
}

/*
Display Cocktail Data in the DOM
*/
function displayCocktailData(cocktail) {
  const container = document.getElementById("cocktail-container");

  if (!cocktail) {
    container.innerHTML = "<p>No cocktail found.</p>";
    return;
  }

  let ingredients = "";
  for (let i = 1; i <= 15; i++) {
    const ing = cocktail[`strIngredient${i}`];
    const meas = cocktail[`strMeasure${i}`];

    if (ing) {
      ingredients += `<li>${meas || ""} ${ing}</li>`;
    }
  }

  container.innerHTML = `
    <h2>${cocktail.strDrink}</h2>
    <img src="${cocktail.strDrinkThumb}" width="300" />
    <ul>${ingredients}</ul>
    <p>${cocktail.strInstructions}</p>
  `;
}

/*
Call init() when the page loads
*/
window.onload = init;
