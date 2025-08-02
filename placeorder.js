
     var button=document.getElementById("btn")
     var name=document.getElementById("name")
     var uaddr=document.getElementById("addr")
      var pay=document.getElementById("pay")
     function change(){
      if(name.value=="" || uaddr.value=="" || pay.value=="" ){   
            alert("please enter the requirements shown in the form");
          }else{
                alert("congratulations ! your order placed successfully ✔️ ");
              window.open("home.html")
          }
          }
