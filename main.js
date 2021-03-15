function Validator(formSelector, group, errorMess, options = {}) {
    var formRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }

    /**
     * Quy ước:
     * - nếu có lỗi thì return `error message`
     * - nếu không có lỗi thì return `undefined`
     */

    var validattorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Email không hợp lệ'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập ít hơn ${max} kí tự`
            }
        },
        retypePassword: function (value) {
            let ele = document.querySelector('[name=password]').value;
            return value == ele ? undefined : "Mật khẩu nhập lại không chính xác"
        },
        phone: function (value) {
            var phoneNumber = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
            return phoneNumber.test(value) ? undefined : 'Số điện thoại không hợp lệ'
        }

    };

    // lấy ra from element trong DOM `formSelector`
    var formElement = document.querySelector(formSelector);

    // chỉ xử lý khi có element trong DOM
    if (formElement) {

        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');

            for (var rule of rules) {
                var ruleLength;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleLength = rule.split(':');
                    rule = ruleLength[0]
                }

                var ruleFunc = validattorRules[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleLength[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }


            // lắng nghe event để validate

            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        // hàm thực hiện validate
        function handleValidate(e) {
            var rules = formRules[e.target.name];
            var errorMessage;

            rules.find(function (rule) {
                errorMessage = rule(e.target.value);
                return errorMessage
            });

            // nếu có lỗi
            if (errorMessage) {
                var formGroup = getParent(e.target, group);

                if (formGroup) {
                    // add class error
                    formGroup.classList.add('invalid')

                    var formMessage = formGroup.querySelector(errorMess);
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    };
                }
            }

            return !errorMessage;
        }

        // hàm clear error
        function handleClearError(e) {
            var formGroup = getParent(e.target, group);
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector(errorMess);
                if (formMessage) {
                    formMessage.innerText = "";
                };
            }
        }
    }

    // xử lý hành vi submit form

    formElement.onsubmit = function (e) {
        e.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;

        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            };
        }

        if (isValid) {
            if (typeof options.onSubmit === 'function') {
                var dataValue = document.querySelectorAll(formSelector + ' input');
                var data = {}

                for (var input of dataValue) {
                    data[input.name] = input.value
                }
                return options.onSubmit(data);
            }
            formElement.submit();
        }
    }
}