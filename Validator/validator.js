function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function Validate(inputElement, rule){
        

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');

        var errorMessage;

        //lay tung rule
        var rules = selectorRules[rule.selector];
        //chay qua tung rule and check
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type){
                case ('radio'):
                case ('checkbox'):
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                    default: errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)

    if(formElement){

        formElement.onsubmit = function(e){                
                e.preventDefault();

                var isFormValid = true;

                //lap tung rule xet validate
                options.rules.forEach(function (rule){
                    var inputElement = formElement.querySelector(rule.selector);
                    var isValid = Validate(inputElement, rule);
                    
                    if (!isValid) { 
                        isFormValid = false;
                    }
                });

                if(isFormValid){
                    if (typeof options.onSubmit === 'function'){

                        var enableInputs = formElement.querySelectorAll('[name]');
                        var formValues = Array.from(enableInputs).reduce(function(values,input){
                            
                            switch(input.type){
                                case 'checkbox':
                                    if(!input.matches(':checked')) {
                                        values[input.name] = '';
                                        return values;
                                    }

                                    if (!Array.isArray(values[input.name])){
                                        values[input.name] = [];
                                    }

                                    values[input.name].push(input.values)

                                    break;
                                case 'radio':
                                    if(input.matches(':checked')){
                                        values[input.name] = input.value;
                                        break;      
                                    }
                                    else{
                                        values[input.name] = '';
                                    }

                                    break;
                                case 'file':
                                    values[input.name] = input.files;   
                                    break;
                                default:
                                    values[input.name] = input.value;
                            }

                            return  values;    
                        }, {});

                        options.onSubmit(formValues);
                    }
                    //submit default
                    else{
                        formElement.submit();
                    }
                }
            }   

        //Lap tung rule and xu li
        options.rules.forEach(function (rule){
            //Luu all rule

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement){
                if (inputElement){
                    //blur out input
                    inputElement.onblur = function () {
                        Validate(inputElement, rule);
                    }
    
                    //start input
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })

        })
    }


}

Validator.isEmail = function(selector, message){

    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui long nhap email dung';
        }
    }
}

Validator.isRequired = function(selector, message){

    return {
        selector: selector,
        test: function(value){
            return value ? undefined : 'Vui long nhap o nay';
        }
    };
}

Validator.minLength = function(selector, min){

    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ky tu :V`
        }
    }
}

Validator.isConfirm = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Gia tri nhap vao khong chinh xac';
        }
    }
}