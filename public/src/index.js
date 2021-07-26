import React, { useState, useEffect, Fragment } from 'react'
import { render } from 'react-dom'
import { createPiRegister, createPiPayment, authenticatePiUser, openPiShareDialog } from './services/pi';
import { makeStyles, Button, Container, Grid, TextField, CircularProgress, Typography, Paper, AppBar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

//import './utils/pi-mock';

const isDev = process.env.NODE_ENV === 'development';
window.isDev = isDev;

//window.PiMockConfig = {
//     production_domain: isDev ? 'https://wepi.social' : 'https://wepi.social',
//     production_domain: false,
//     debug: isDev,
//     username: 'wepi',
//     uid: '12345678-1234-414e-b578-42e89d1f3c02',
     //payment_found: {
     //    amount: 1, // Amount of π to be paid
     //    memo: "Please pay for your order #12345", // User-facing explanation of the payment
     //    metadata: {orderId: 12345}, // Developer-facing metadata
     //},
//     payment_error: false, //'There has been an error with your payment',
//     payment_cancelled: false, //'Your payment was cancelled',
//}

const useStyles = makeStyles((theme) => ({
    root: {},
    mb1: {
        marginBottom: '1em'
    },
    paper: {
        padding: '1em'
    },
    appBar: {
        paddingLeft: '1em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    logoImg: {
        height: '2.5em',
        width: 'auto',
        marginRight: '1em'
    },
    logoArea: {
        marginTop: '1em',
        padding: '1em 1em 1em 2.5em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    loading: {
        display: 'flex',
        top: '0px',
        margin: '0px auto',
        position: 'absolute',
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center'
    },
    listList: {
        padding: 0,
        margin: '0 0 1em 0'
    },
    form: { 
        display: 'flex', 
        width: '100%', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    }
}))

const App = () => {
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [amountToTransfer, setAmountToTransfer] = useState('');
    const [walletKey, setWalletKey] = useState('');
    const [inPiBrowser, setInPiBrowser] = useState(null);
    const [piUser, setPiUser] = useState(null);
    const [usernameToTransfer, setUserNameToTransfer] = useState('');
    const [passwordToTransfer, setPasswordToTransfer] = useState('');

    const classes = useStyles();

    //on component mount
    useEffect(() => {
        if (navigator.userAgent.includes('PiBrowser')) {
            // the user is NOT running Chrome
            setInPiBrowser(true)
        }

        //authenticate pi user
        const piAuth = authenticatePiUser();
        if (piAuth) {
            setPiUser(piAuth)
        }

        //clean up not neccessary
        return () => {}
    }, [])

    //on apiResponse updated
    useEffect(() => {
        const timeout = setTimeout(() => {
            //clear apiResponse after 2 seconds
            setApiResponse(null)
        }, 5000)
        
        //clean up
        return () => {
            //clear timeout if it has not already finished
            clearTimeout(timeout)
        }
    }, [apiResponse])

    const piPayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        //create pi network payment
        var config = {	
            amount: amountToTransfer,
            memo: 'wepi:payment',
            metadata: {
                receipt_name: "",
                comment: "Comment",
            }
        };
        await createPiPayment(config);

        //if (isDev) {
        //    setApiResponse({
        //        message: 'Payment complete!',
        //        status: 'success'
        //    });
        //}
        
        setLoading(false);
    }

    const piRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        //create pi network payment
        var config = {	
            amount: amountToTransfer < 0.01? 0.01: amountToTransfer,
            memo: 'wepi:account',
            metadata: {
                ref_id: "12345678-1234-414e-b578-42e89d1f3c03",
            }
        };
	// create user register info
	var info = {
            username: usernameToTransfer,
	    password: passwordToTransfer,
	    password_verify: passwordToTransfer,
            show_nsfw: true,
	    email: null,
	    captcha_uuid: null,
	    captcha_answer: null,
	};
        await createPiRegister(info, config);

        //if (isDev) {
        //    setApiResponse({
        //        message: 'Payment complete!',
        //        status: 'success'
        //    });
        //}
        
        setLoading(false);
    }

    const openDialog = () => {
        openPiShareDialog('WePi', 'This is my first pi dialog')
    }

    return (
        <Fragment>
            {
                loading && (
                    <div className={classes.spinner}>
                        <CircularProgress />
                    </div>
                )
            }
            <AppBar variant="elevation" position="static" className={classes.appBar}>
                <h2>WePi</h2>
            </AppBar>
            <Container maxWidth={'xs'}>
                <Grid item xs={12}>
                    <div style={{ marginTop: '1em' }} />
                    {
                        isDev && (
                            <Alert severity="warning">Development mode is enabled all Pi payments will be simulated.</Alert>
                        )
                    }
                    {
                        !inPiBrowser && !isDev && (
                            <Alert severity="error">Please use this app in the Pi Browser. Any payments made will not be processed and this is just a simulation when ran outside of the Pi Browser.</Alert>
                        )
                    }
                    <section className={classes.mb1}>
                    <div className={classes.logoArea}>
                        <img className={classes.logoImg} width="50" src="data:image/png;base64,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"/>
                        <span>+</span>
                        <img className={classes.logoImg} height="50" src="https://minepi.com/assets/logo-667cd4f63cb2e6f261e16560dea7ac9c9235dcfaf9a285274a576efc96b9ec79.png"/>
                    </div>  
                    </section>
                    <hr className={classes.mb1} />
                    <Paper className={[classes.paper, classes.mb1]}>
                        <div style={{ margin: '0 0 1em' }}>
                            <Typography>Registration / Reset Password</Typography>
                        </div>
                        
                        {
                            apiResponse && (
                                <div className={classes.mb1}>
                                    <Alert severity={apiResponse.status}>{apiResponse.message}</Alert>
                                </div>
                            )
                        }
                        <form onSubmit={piRegister} className={classes.form}>
                            <small className={classes.mb1}>This will transfer {amountToTransfer < 0.1 ? 'the requested amount of ' : `${amountToTransfer} `} test-π to our development test wallet for registration</small>
                            {/* <TextField className={classes.mb1} type="text" fullWidth variant="outlined" label="Wallet to send Pi to" value={walletKey} onChange={(e) => setWalletKey(e.target.value)} /> */}
                            <TextField className={classes.mb1} type="text" fullWidth variant="outlined" label="Your's WePi UserName" value={usernameToTransfer} onChange={(e) => setUserNameToTransfer(e.target.value)} />
                            <TextField className={classes.mb1} type="password" fullWidth variant="outlined" label="Your's WePi Password" value={passwordToTransfer} onChange={(e) => setPasswordToTransfer(e.target.value)} />
                            <TextField className={classes.mb1} type="number" fullWidth variant="outlined" label="Amount to pay for registration (0.001 PI)" value={amountToTransfer} onChange={(e) => setAmountToTransfer(e.target.value)} />
                            <Button variant="text" fullWidth type="submit">Register</Button>
                        </form>
                    </Paper>
                     
                </Grid>
            </Container>
        </Fragment>
        
    )
}

render(<App />, document.getElementById('root'))
