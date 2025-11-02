import { useReducer } from 'react'


const useEventForm = () => {

    const initialState = {
        title: "",
        description: "",
        location: "",
        date: "",
        startTime: "",
        endTime: ""
    }

    function reducer(state, action) {
        switch(action.type) {
            case 'NEW_EVENT':
               return {
                ...state,
                ...action.payload
               } 

            case 'UPDATE_EVENT':
                return {
                    ...state,
                    [action.field]: action.value
                }

            case 'RESET':
                return action.payload
        }
    }
  
    const [state, dispatch] = useReducer(reducer, initialState);
    return { state, dispatch }
}

export default useEventForm