var main = function() {

  console.log("question running ok");

  $('#enterButton').on('click', function () {

    var userQuestion = $('#userQuestion').val();
    var userAnswer = $('#userAnswer').val();
    console.log(typeof(userAnswer));

    var request = {
      'userQuestion' : userQuestion,
      'userAnswer' : userAnswer
    };

    var data = {'data': JSON.stringify(request)};

    console.log(typeof(data));

    $.post('http://localhost:3000/question', data, function(response) {

      console.log(typeof(response));
      console.log(response);
      
    });
  });



  $('#userQuestion').focus(function() {
    if(this.value === 'Enter Question Here') {
      this.value = '';
    }
  });

  $('#userAnswer').focus(function() {
    if(this.value === 'Enter Answer Here') {
      this.value = '';
    }
  });
}
$(document).ready(main);
