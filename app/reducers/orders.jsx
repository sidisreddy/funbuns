import axios from 'axios'

/* --------------------- ACTIONS ------------------- */
const LOAD_ORDERS = 'LOAD_ORDERS'
const REMOVE_ORDER = 'REMOVE_ORDER'
const EDIT_ORDER = 'EDIT_ORDER'

/* ------------------ACTION-CREATORS--------------- */
const load = orders => ({ type: LOAD_ORDERS, orders })
const edit = order => ({ type: EDIT_ORDER, order })
const remove = id => ({ type: REMOVE_ORDER, id })

/* --------------------- THUNKS -------------------- */
export const loadOrders = () => {
    return (dispatch) => {
        axios.get('/api/orders')
            .then((res) => (dispatch(load(res.data))))
            .catch(err => console.error('Failed Loading Orders', err))
    }
}

export const editOrder = (order) => {
    return (dispatch) => {
        axios.put(`/api/orders/${order.id}`, order)
            .then((res) => {
                dispatch(edit(res.data))
            })
            .catch(err => console.error('Unable to update order', err))

    }
}

export const removeOrder = (id) => {
    return (dispatch) => {
        axios.delete(`/api/orders/${id}`)
            .then(() => {
                dispatch(remove(id))
            })
            .catch(err => console.error('Failed deleting order', err))
    }
}

const initialState = {
    orders: [],
    selectedOrder: null
}

/* --------------------- REDUCER ------------------- */
export default function reducer(state = initialState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {

  case 'LOAD_ORDERS':
    newState.orders = action.orders
    break

  case 'EDIT_ORDER':
    newState.orders = newState.orders.map((order) => {
      return order.id === action.order.id ? action.order : order
    })
    break

  case 'REMOVE_ORDER':
    newState.orders = newState.orders.filter((order) => {
      return order.id !== action.order.id
    })
  }
  return newState
}
