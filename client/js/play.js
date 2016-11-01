var main = function() {

  getNewQuestion();

  $('#enterButton').on('click', function() {

    var answerResponse = $('#userAnswer').val();
    var ansKeyResponse = $('#answerId').val();

    var request = {
      'answer': answerResponse,
      'answerId': ansKeyResponse
    };

    var data = {'data': JSON.stringify(request)};

    $.post('http://localhost:3000/answer', data, function(response) {

      console.log("something redis: " + response);
      var response = JSON.stringify(response.correct);

      if(response === 'true') {

        var $paragraphGood = $('<p>').text('Good Job!');
        $('#reslutBox').empty().append($paragraphGood);
      }
      else {

        var $paragraphGood = $('<p>').text('Next time!');
        $('#reslutBox').empty().append($paragraphGood);

      }

      $.get('http://localhost:3000/scores', function(response) {

        var right = JSON.stringify(response.right);
        var wrong = JSON.stringify(response.wrong);

        $('#updateCorrect').html(' ' + right);
        $('#updateWrong').html(' ' + wrong);

      });

    });
    getNewQuestion();

    $('#userAnswer').focus(function() {
      if(this.value === answerResponse) {
        this.value = '';
      }
    });

    $('#answerId').focus(function() {
      if(this.value === ansKeyResponse) {
        this.value = '';
      }
    });
  });

  function getNewQuestion() {

    $.get('http://localhost:3000/question', function(response) {

      var $paragraph = $('<p>');
      var question = response.question;
      var answer = response.answer;
      var qID = response.answerId;

      console.log(question + " " + answer + " " + qID)

      $paragraph.text(question + ' ' + '(answer-key: ' + qID +')');
      $('#questionBox').append($paragraph);
    });


    $('#resetScore').on('click', function() {
      $.post('http://localhost:3000/reset', function(response) {
        console.log(response);
      });
    });
  }

  $('#userAnswer').focus(function() {
    if(this.value === 'Your Answer Here') {
      this.value = '';
    }
  });

  $('#answerId').focus(function() {
    if(this.value === 'Answer-Key') {
      this.value = '';
    }
  });
};

$(document).ready(main);
