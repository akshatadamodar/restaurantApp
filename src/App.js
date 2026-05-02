import {Component} from 'react'
import {FaShoppingCart} from 'react-icons/fa'
import './App.css'

const apiUrl =
  'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'

class App extends Component {
  state = {
    restaurantName: '',
    categories: [],
    activeCategoryId: '',
    cartCount: 0,
  }

  componentDidMount() {
    this.getMenuDetails()
  }

  getMenuDetails = async () => {
    const response = await fetch(apiUrl)
    const data = await response.json()

    const restaurantData = data[0]

    const updatedCategories = restaurantData.table_menu_list.map(each => ({
      menuCategory: each.menu_category,
      menuCategoryId: each.menu_category_id,
      categoryDishes: each.category_dishes.map(dish => ({
        dishId: dish.dish_id,
        dishName: dish.dish_name,
        dishPrice: dish.dish_price,
        dishCurrency: dish.dish_currency,
        dishDescription: dish.dish_description,
        dishImage: dish.dish_image,
        dishCalories: dish.dish_calories,
        dishAvailability: dish.dish_Availability,
        dishType: dish.dish_Type,
        addonCat: dish.addonCat,
        quantity: 0,
      })),
    }))

    this.setState({
      restaurantName: restaurantData.restaurant_name,
      categories: updatedCategories,
      activeCategoryId: updatedCategories[0].menuCategoryId,
    })
  }

  changeCategory = id => {
    this.setState({activeCategoryId: id})
  }

  increaseQuantity = dishId => {
    this.setState(prevState => ({
      categories: prevState.categories.map(category => ({
        ...category,
        categoryDishes: category.categoryDishes.map(dish => {
          if (dish.dishId === dishId) {
            return {...dish, quantity: dish.quantity + 1}
          }
          return dish
        }),
      })),
      cartCount: prevState.cartCount + 1,
    }))
  }

  decreaseQuantity = dishId => {
    this.setState(prevState => {
      let isDecreased = false

      const updatedCategories = prevState.categories.map(category => ({
        ...category,
        categoryDishes: category.categoryDishes.map(dish => {
          if (dish.dishId === dishId && dish.quantity > 0) {
            isDecreased = true
            return {...dish, quantity: dish.quantity - 1}
          }
          return dish
        }),
      }))

      return {
        categories: updatedCategories,
        cartCount: isDecreased ? prevState.cartCount - 1 : prevState.cartCount,
      }
    })
  }

  renderHeader = () => {
    const {restaurantName, cartCount} = this.state

    return (
      <nav className="header">
        <h1 className="restaurant-name">{restaurantName}</h1>
        <div className="cart-container">
          <p className="my-orders">My Orders</p>
          <div className="cart-icon-container">
            <FaShoppingCart className="cart-icon" />
            <p className="cart-count">{cartCount}</p>
          </div>
        </div>
      </nav>
    )
  }

  renderTabs = () => {
    const {categories, activeCategoryId} = this.state

    return (
      <ul className="tabs-container">
        {categories.map(each => (
          <li key={each.menuCategoryId}>
            <button
              type="button"
              className={
                activeCategoryId === each.menuCategoryId
                  ? 'tab-button active-tab'
                  : 'tab-button'
              }
              onClick={() => this.changeCategory(each.menuCategoryId)}
            >
              {each.menuCategory}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  renderDishItem = dish => {
    const dishTypeClass = dish.dishType === 2 ? 'non-veg' : 'veg'

    return (
      <li className="dish-card" key={dish.dishId}>
        <div className={`dish-type-box ${dishTypeClass}`}>
          <div className={`dish-type-dot ${dishTypeClass}`} />
        </div>

        <div className="dish-details">
          <h1 className="dish-name">{dish.dishName}</h1>
          <p className="dish-price">
            {dish.dishCurrency} {dish.dishPrice}
          </p>
          <p className="dish-description">{dish.dishDescription}</p>

          {dish.dishAvailability ? (
            <div className="quantity-container">
              <button
                type="button"
                className="quantity-button"
                onClick={() => this.decreaseQuantity(dish.dishId)}
              >
                -
              </button>
              <p className="quantity">{dish.quantity}</p>
              <button
                type="button"
                className="quantity-button"
                onClick={() => this.increaseQuantity(dish.dishId)}
              >
                +
              </button>
            </div>
          ) : (
            <p className="not-available">Not available</p>
          )}

          {dish.addonCat.length > 0 && (
            <p className="customization">Customizations available</p>
          )}
        </div>

        <p className="calories">{dish.dishCalories} calories</p>

        <img src={dish.dishImage} alt={dish.dishName} className="dish-image" />
      </li>
    )
  }

  renderDishes = () => {
    const {categories, activeCategoryId} = this.state
    const activeCategory = categories.find(
      each => each.menuCategoryId === activeCategoryId,
    )

    if (!activeCategory) {
      return <p className="loading">Loading...</p>
    }

    return (
      <ul className="dishes-container">
        {activeCategory.categoryDishes.map(each => this.renderDishItem(each))}
      </ul>
    )
  }

  render() {
    return (
      <div className="app-container">
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderDishes()}
      </div>
    )
  }
}

export default App
