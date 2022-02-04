const users = [];

//socket id
const addUser = ({id,username,room}) =>{
  //Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()
  //Validate
  if(!username || !room){
    return {
      error: 'Username and room are required'
    }
  }
  //Check for existing user
  const existingUser = users.find(user=>{
    return user.room === room && user.username === username
  })
  //Validate username
  if (existingUser) {
    return { error: "Username is in use!"}
  }
  //Store User
  const user = {id,username,room}
  users.push(user)
  return { user }
}

const removeUser = (id) =>{
  //find index returns 1 or -1 if true or false
  const index = users.findIndex((user)=>user.id === id)
  if(index !== -1){
    //splice returns an array of the items we removed.
    //if we want an object back we add the index 0 at the end (if we're removing a single item)
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => users.find(user=>user.id===id)
const getUsersInRoom = (room) => users.filter(user=>user.room===room)

module.exports = {
  addUser, getUser, getUsersInRoom, removeUser
}