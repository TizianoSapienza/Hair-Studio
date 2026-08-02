BlockedSlot

date(date, required)
start_time(text, required)
end_time(text, required)
staff_id(text)
staff_name(text)
note(text)
description(text) Additional Properties: maxLength: 1000

--------------------------------
Booking

date(date, required)
start_time(text, required)
duration_minutes(number, required)
slots_count(number)
client_name(text)
client_email(text)
client_phone(text)
service_id(text)
service_name(text)
staff_id(text)
staff_name(text)
status(text, required) Default: "booked" Options: booked, confirmed, blocked, completed, cancelled,no_show
description(text) Additional Properties: maxLength: 1000

--------------------------
BusinessInfo

nome_attivita(text, required)
indirizzo(text, required)
telefono(text, required)
email(text)
instagram_url(text)
facebook_link(text)
whatsapp_link(text)
google_maps_link(text)
google_review_link(text)
orari(array):
 giorno(text) orario(text) chiuso(boolean) note_orari(text)
description(text) Additional Properties: maxLength: 1000

------------------------------------
Closures

start_date(date, required)
end_date(date)
type(text, required) Default: "closed" Options: closed, modified
open_time(text)
close_time(text)
note(text)
description(text) Additional Properties: maxLength: 1000

-------------------------------
HomePageContent

hero_title(text)
hero_subtitle(text)
chi_siamo_titolo(text)
chi_siamo_testo(text)
card1_numero(text)
card1_testo(text)
card2_numero(text)
card2_testo(text)
card3_numero(text)
card3_testo(text)
footer_description(text)
about_chi_siamo(text)
about_come_funziona(text)
about_team(text)
description(text) Additional Properties: maxLength: 1000

----------------------------------
Notification

user_id(text, required)
tipo(text, required) Options: nuova_prenotazione, prenotazione_confermata, prenotazione_cancellata
messaggio(text, required)
booking_id(text)
letta(boolean) Default: false

------------------------------------
OpeningHours

days(array, required):
  day_of_week(number, required) open(boolean, required) start_time(text) end_time(text)
slot_minutes(number, required) Default: 30
description(text) Additional Properties: maxLength: 1000

---------------------------------
PushToken

user_id(text, required)
token(text, required)
description(text) Additional Properties: maxLength: 1000

---------------------------------
Service

name(text, required)
description(text)
duration_minutes(number, required)
price(number, required)
image_url(text)
active(boolean) Default: true
order(number) Default: 0

------------------------------
ServicePriceHistory

service_id(text, required)
service_name(text)
previous_price(number)
previous_duration(number)
new_price(number)
new_duration(number)
description(text) Additional Properties: maxLength: 1000

----------------------------------
Staff

name(text, required)
photo_url(text)
specialization(text)
order(number) Default: 0
description(text) Additional Properties:maxLength: 1000


--------------------------------------------
Users (Integrata di base44)
email(text, required)
The email of the user

full_name(text, required)
The full name of the user

role(text, required)
The role of the user in the app Options: admin, user
first_name(text)
last_name(text)
phone(text)