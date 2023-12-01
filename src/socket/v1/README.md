# SOCKET IO
# Join exited room:
```typescript
joinRoom = (room: string) => {
  socket.emit('JOIN_ROOM', room);
}

leaveRoom = (room: string) => {
  socket.emit('LEAVE_ROOM', room);
}

broadcastData = (room: string, data: any) => {
   socket.emit('GAME_CHANEL', room, data);
}

// Listen event from room:
socket.on('GAME_CHANEL', (data) => {
  console.log(data);
});

socket.on('connect_error', (error) => {
  throw new Error('Unable to connect to the server. Please try again later.');
});
```