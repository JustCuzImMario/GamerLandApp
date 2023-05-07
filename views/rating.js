function submitRating(rating) {
    const gameId = document.querySelector('#gameId').value;
    const ratingData = {
      gameId: gameId,
      rating: rating
    };
    fetch('/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ratingData)
    })
    .then(response => {
      if (response.ok) {
        // Rating successfully saved in database
        alert('Your rating has been saved!');
      } else {
        throw new Error('Network response was not ok.');
      }
    })
    .catch(error => {
      console.error('There was a problem saving the rating:', error);
    });
  }
  