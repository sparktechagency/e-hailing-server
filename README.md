### questions

[price
](https://docs.google.com/document/d/1Fwrt3zfrWVLZaNet_pcU5jgZWq8KcqivnKhmnloRbvk/edit?tab=t.0)

### modifications in figma

1. `seats`, `evpNumber`, `evpExpiry`, `carNumber` missing when adding a car in dashboard
2. in a booking request, when a user selects a car, adds details and confirms for booking. Do not show the user instantly the driver's data and his request has been accepted. Instead, show the user that his request has been sent to the driver and he will be notified when the driver accepts the request.
   booking flow:

```
    - User selects car and adds booking details
    - User confirms booking request
    - Show "Request sent to driver" message
    - User receives notification when driver accepts
```

3. dashboard | in `driver` section -> statics -> add `total`. Check if it can be done for the driver section in app
4. dashboard | in `D coin` section -> change this to 1 dCoin = 10 MYR.

### commented code (uncomment on production only)

1. in `car.service`, in `updateAssignCarToDriver`, prevent a driver from being assigned to more than one car at a time

### collections

1. auths
2. users
3. drivers
4. admins
5. cars
6. trips
7. savedLocations
8. reviews
9. notifications
10. messages
11. conversations
12. dCoins
13. payments
