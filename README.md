### Documents

<details>
<summary>📌 Docs</summary>

[Price Document](https://docs.google.com/document/d/1Fwrt3zfrWVLZaNet_pcU5jgZWq8KcqivnKhmnloRbvk/edit?tab=t.0)

</details>

---

### To Do

<details>
<summary>To do</summary>

1. In `trip.service` in `getTripStatistics`, make the function work properly after enough data.
   - update the trip after completion and update the paymentType and money/coin
   - get the total cash and coin and parse the coin to add see the total earnings.
   - only count for completed trips.

</details>

---

### New Features

<details>
<summary>🚀 New Features</summary>

1. Invoice generation of trips

</details>

---

### modifications in figma

<details>
<summary>🖌 Modifications in Figma</summary>

1.  `seats`, `evpNumber`, `evpExpiry`, `carNumber` missing when adding a car in dashboard
2.  in a booking request, when a user selects a car, adds details and confirms for booking. Do not show the user instantly the driver's data and his request has been accepted. Instead, show the user that his request has been sent to the driver and he will be notified when the driver accepts the request.
    booking flow:

```
   - User selects car and adds booking details
   - User confirms booking request
   - Show "Request sent to driver" message
   - User receives notification when driver accepts
```

3.  dashboard | in `driver` section -> statics -> add `total`. Check if it can be done for the driver section in app
4.  dashboard | in `D coin` section -> change this to 1 dCoin = 10 MYR.
5.  app | toll adding screen missing
6.  app | show route button. clicking on that button will take driver to google navigation
7.  app | in `driver` section -> statics -> change `this week` to `all time`
8.  no card/online payment

</details>

---

### commented code (consider uncommenting on production only)

<details>
<summary>🧪 Commented Code</summary>

1. In `car.service`, in `updateAssignCarToDriver`, prevent a driver from being assigned to more than one car at a time
2. In `trip.service` in `getTripStatistics`, uncomment `matchStage`

</details>

---

### fix code

<details>
<summary>🔧 Code Fixes</summary>

- Before completing a trip, calculate `tollFee` and add it to the final amount

</details>

---

### collections

<details>
<summary>🗃 Collections</summary>

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
14. onlineSessions

</details>
Fiuu Developer Account

Admin URL : https://portal.fiuu.com/

Merchant Admin : duducar_Dev

Email : duducar@domain.com

Password: Duducarmalaysia#2025
