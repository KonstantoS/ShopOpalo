Shop = (function(){
    var avaiableMoney,
        cart = {},
        itemTpl,
        productsData,
        totalSum;
    
    function cartOutput(){
        totalSum=0;
        var cartPosTpl,
            tableRows= "<tr><th>#</th><th>Position name</th><th>Qty</th><th>Price</th><th></th></tr>";            
        $.ajax({
               url: 'templates/cart-position.tpl.html',
               type: 'get',
               dataType: 'html',
               async: false,
               success: function(data) {
                   cartPosTpl = data;
               } 
            });
        i=0;
        for(row in cart){
            i++;
            cart[row]['num']=i;
            totalSum+= cart[row]['qty']*cart[row]['price'];
            tableRows += Templater.parseData(cartPosTpl,cart[row]);
        }
        if(Object.keys(cart).length>0){
            var myNumber = totalSum;
            var dec = myNumber - Math.floor(myNumber);
            myNumber = myNumber - dec;
            ("0" + myNumber).slice(-2) + dec.toString().substr(1);
            
            $('.cart-total').text("$"+myNumber);
            $('.cart-table').html(tableRows);
            
            
            $(".cart-table .infoCircle").click(function(){
                Shop.updCartData($(this).attr("id").replace("item-del-",""),0);
            });
            $(".cart-table input[type='text']").keypress(function(e){
                if(e.which === 13){
                    e.preventDefault();
                    Shop.updCartData($(this).attr("id").replace("item-qty-",""),$(this).val());
                }
            });
            $(".cart-table input[type='text']").change(function(){
                Shop.updCartData($(this).attr("id").replace("item-qty-",""),$(this).val());
            });
        }
        else{
            $('.cart-total').text("$0.00");
            $('.cart-table').html("Nothing in cart yet!");
        }
    }
    return {
        newInCart : 0,
        productsView : function(){
            
            $.ajax({
               url: 'templates/item.tpl.html',
               type: 'get',
               dataType: 'html',
               async: false,
               success: function(data) {
                   itemTpl = data;
               } 
            });
            $.ajax({
               url: 'data.json',
               type: 'get',
               dataType: 'json',
               async: false,
               success: function(data) {
                   productsData = data;
               } 
            });
            
            for(key in productsData){
                productsData[key]['id'] = key;
                $('.product-list').append(Templater.parseData(itemTpl,productsData[key]));
            }
            $('.item .button').click(function(){
                id = $(this).attr("id").replace("item-","");
                Shop.updCartData(id);
                if(this.newInCart!==0){
                    $(" #cart-widget > .infoCircle").text(Shop.newInCart).show();
                }
            });
        },
        updCartData: function(id, qty){  
            if(cart.hasOwnProperty("item_"+id)){
                if(qty === undefined){
                    cart["item_"+id]['qty'] += 1;
                }
                else if(qty === 0){
                    delete cart["item_"+id]
                }
                else{
                    cart["item_"+id]['qty'] = qty;
                }
            }else{
                cartPos = productsData[id];
                cartPos['qty'] = 1;  
                cart["item_"+id] =cartPos;
                this.newInCart++;
            }
            window.localStorage.setItem('cart',JSON.stringify(cart));
            cartOutput();
        },
        buy: function(){
            cart = {};
            window.localStorage.clear();
            cartOutput();
        },
        init: function(){
            cart =  window.localStorage.getItem('cart') !== null ? JSON.parse(window.localStorage.getItem('cart')) : {};
            cartOutput();
        }
    };
})();


Templater = (function(){
    return {
        parseData: function(html, dataArray){
            for (var key in dataArray){
                if (dataArray.hasOwnProperty(key)) {
                    holder = new RegExp('{{'+key+'}}', 'g');
                    html = html.replace(holder,dataArray[key]); 
                }
            }
            return html;
        },
        init: function(){
            var option = location.hash.replace('#','') ? location.hash.replace('#','') : 'home';
            this.initPage(option);
        },
        initPage : function(tpl){
            $.get('templates/'+tpl+'.tpl.html', function(data){
                $('.content').html(data);
                $("#buy").click(Shop.buy);
                Shop.productsView();
                Shop.init();
            });
        }
    }    
})();
$(window).on('hashchange', function() {
        Templater.init();
    });

$(document).ready(function(){
    Templater.init();
    $("#cart-widget").hover(function(){
        Shop.newInCart = 0;
        $(" #cart-widget > .infoCircle").hide();
    });
});