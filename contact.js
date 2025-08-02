const button=document.getElementById("btn")
     var name=document.getElementById("uname")
     var msg=document.getElementById("msg")
      var em=document.getElementById("semail")
     function show(){
      if(name.value=="" || em.value=="" || msg.value=="" ){   
            alert("please enter the detail shown in the form");
          }else{
            alert("your message submitted successfully✔️ ");
            window.open("home.html")
          }
          }