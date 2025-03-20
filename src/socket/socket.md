### Trip Request Flow

sequenceDiagram

```
    User->> Server: HTTP POST /trips (Create Trip)
    Server->> MongoDB: Save trip (status: 'requested')
    Server->> All Drivers: Socket emit('new_trip', tripData)
    Driver->> Server: Socket emit('accept_trip', tripId)
    Server->> MongoDB: Update trip (status: 'accepted')
    Server->> User: Socket emit('driver_assigned')
    Server->> Driver: Socket emit('trip_confirmed')
```
