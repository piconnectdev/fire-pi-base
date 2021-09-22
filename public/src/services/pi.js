import axios from './axios';

const Pi = window.Pi;
var piUser;
var piApiResult;
export const authenticatePiUser = async () => {
    // Identify the user with their username / unique network-wide ID, and get permission to request payments from them.
    const scopes = ['username','payments'];
    
    try{
        piUser = await Pi.authenticate(scopes, onIncompletePaymentFound);
	return piUser;

    } catch(err) {
        console.log(err)
    }
}

export const piApiResponse = async () => {
    if (piApiResult === null)
       return null;
    if (piApiResult === undefined)
       return null;
    if (piApiResult === "undefined")
       return null;   
    return piApiResult;
}

export const onIncompletePaymentFound = async (payment) => { 
    //do something with incompleted payment
    console.log('incomplete payment found: ', payment) 
    //alert(payment);
    const { data } = await axios.post('/pi/found', {
        paymentid: payment.identifier,
	    pi_username: piUser.user.username,
	    pi_uid: piUser.user.uid,
        auth: null,
        dto: null
    });

    if (data.status === 500) {
        //there was a problem approving this payment show user body.message from server
        //alert(`${data.status}: ${data.message}`);
        return false;
    } 

    if (data.status === 200) {
        //payment was approved continue with flow
        //alert(payment);
        return data;
    }
}; // Read more about this in the SDK reference

export const createPiRegister = async (info, config) => {
    piApiResult = {};
    piApiResult.approved = false;
    Pi.createPayment(config, {
        // Callbacks you need to implement - read more about those in the detailed docs linked below:
        onReadyForServerApproval: (payment_id) => onReadyForApprovalRegister(payment_id, info, config),
        onReadyForServerCompletion:(payment_id, txid) => onReadyForCompletionRegister(payment_id, txid, info, config),
        onCancel,
        onError,
      });      
    return piApiResult;
}

export const onReadyForApprovalRegister = async (payment_id, info, paymentConfig) => {
    //make POST request to your app server /payments/approve endpoint with paymentId in the body
    try {
        const { data } = await axios.post('/pi/agree', {
            paymentid: payment_id,
            pi_username: piUser.user.username,
            pi_uid: piUser.user.uid,
            info,
            paymentConfig
        }) 

        if (data.status >= 200 && data.status < 300) {
            //payment was approved continue with flow
            piApiResult.approved = true;
            return;
        } else {
            alert("Agree transaction error: " + JSON.stringify(data));
        }
    } catch(err) {
        alert("Agree transaction catch error: " + JSON.stringify(data));
        piApiResult.approved = false;
    }
}

// Update or change password
export const onReadyForCompletionRegister = (payment_id, txid, info, paymentConfig) => {
    //make POST request to your app server /payments/complete endpoint with paymentId and txid in the body
    if (piApiResult.approved === true ) {
        try {
        axios.post('/pi/register', {
            paymentid: payment_id,
            pi_username: piUser.user.username,
            pi_uid: piUser.user.uid,
            txid,
            info,
            paymentConfig,
        }).then((data) => {
            if (data.status >= 200 && data.status < 300) {
                //payment was completed continue with flow
                // Set call successed.
                piApiResult = {};
                piApiResult.success = true;
                piApiResult.type = "account";
                return;
            } else {
                alert("Register transaction error: " + JSON.stringify(data));
            }
        });
        } catch(err) {
            alert("Register transaction catch error: " + JSON.stringify(data));
        }
    } else {
        alert("Registration was not approved : " + JSON.stringify(data));   
    }
    return;
}

export const createPiPayment = async (config) => {
    piApiResult = {};
    piApiResult.approved = false;
    Pi.createPayment(config, {
        // Callbacks you need to implement - read more about those in the detailed docs linked below:
        onReadyForServerApproval: (payment_id) => onReadyForApproval(payment_id, config),
        onReadyForServerCompletion: onReadyForCompletion,
        onCancel,
        onError,
      });
}

export const onReadyForApproval = async (payment_id, paymentConfig) => {
    //make POST request to your app server /pi/approve endpoint with paymentId in the body    
    const { data } = await axios.post('/pi/approve', {
        payment_id,
        paymentConfig
    })

    if (data.status >= 200 && data.status < 300) {
        //payment was approved continue with flow
        return data;
    } else {
        alert("Approve error: " + JSON.stringify(data.data));
    }
}

export const onReadyForCompletion = async (payment_id, txid) => {
    //make POST request to your app server /pi/complete endpoint with paymentId and txid in the body
    const { data } = await axios.post('/pi/complete', {
        payment_id, 
        txid
    })

    if (data.status >= 200 && data.status < 300) {
        //payment was completed continue with flow
        piApiResult = {};
        piApiResult.success = true;
        piApiResult.type = "payment";
        return true;
    } else {
        alert("Completed error: " + JSON.stringify(data.data));
    }
}

export const onCancelRegister = (paymentId) => {
    console.log('Register cancelled', paymentId)
}

export const onErrorRegister = (error, paymentId) => { 
    console.log('Register error ', error, paymentId) 
    alert("Register Error, id:" + paymentId + ", err:" + JSON.stringify(error));
}

export const onCancel = (paymentId) => {
    console.log('Payment cancelled', paymentId)
}

export const onError = (error, paymentId) => { 
    console.log('Payment error', error, paymentId) 
    alert("Payment Error, id:" + paymentId + ", err:" + JSON.stringify(error));
}

export const openPiShareDialog = (title, message) => {
    Pi.openShareDialog(title, message)
}
