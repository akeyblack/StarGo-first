# API documentation: [*click*](https://stargo-first.herokuapp.com/)
# Telegram Bot: [*click*](https://t.me/StarGoReservationsBot)

<pre> Uses Nest.js, TypeORM MySql, AWS S3, AWS Transcribe </pre>

## APIs
<pre>
1. Speech to text conversion (audio+video). 
  a) Uploads file to aws s3, saves its metadata to db.
  b) Finds file by name, converts it to text, 
     sends email notification about finishing to the user. (AWS Transcribe).
  c) Returns transcriptions.

2. yelp.com parsing by city
  a) Gets first 5 pages of places finded by city, parses them and stores in database.
    parsedData: {
      name,
      description,
      amenities,
      working hours,
      phone number,
      address,
      images, (first three)
      rating, (stars)
      lowest_rated_review,
      highest_rated_review
    }
  b) Returns parsed data.
  c) Returns data by optional filters (amenities, working hour, city).

3. Reservation Telegram Bot
  a) Bot that allows to "reserve" a table in already parsed 
     place with time-to-working-hours validation etc.
  b) API that allows to approve/deny reservation, get reservation "in process".
 </pre>
