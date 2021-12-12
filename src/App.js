import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { Users, Users2, Users3, Users4, Users5 } from "./Users";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 20px;
  border: none;
  background-color: var(--hotpink);
  padding: 10px;
  font-weight: bold;
  color: var(--accent-text);
  width: 150px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: column;
  justify-content: stretched;
  // align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
    justify-content: center;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
  word-break: break-all;
  white-space: break-spaces;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [Claiming, setClaim] = useState(false);
  const [feedback, setFeedback] = useState(`Playing with puppy...`);

  const volume24 = <Users />;
  const liquidity = <Users2 />;
  const price = <Users3 />;
  const marketcap = <Users4 />;

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const Claim = () => {
    setFeedback(`Claiming reward $SBP manually...`);
    setClaim(true);
    blockchain.smartContract.methods
      .ClaimRewards()
      .send({
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaim(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(`You've claimed your rewards.`);
        setClaim(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const [Balance, setBalance] = useState(0);
  const [votedToken, setVTK] = useState(0);
  const [CirculatingSupply, setCS] = useState(0);

  useEffect(async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      const bal = await getBalance();
      setBalance(bal / 10 ** 18);
    } else setBalance("Connect Wallet Please");
  });
  const getBalance = async () => {
    return await blockchain.smartContract.methods
      .balanceOf(blockchain.account)
      .call();
  };

  useEffect(async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      const VTK = await blockchain.smartContract.methods
        .YourUnclaimedVotes(blockchain.account)
        .call();
      setVTK(VTK);
    } else {
      setVTK("Connect WalletPlease");
    }
  });

  useEffect(async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      const CS = await blockchain.smartContract.methods
        .getCirculatingSupply()
        .call();
      setCS(CS);
    } else {
      setCS("Connect WalletPlease");
    }
  });

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--yellow)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper>
          <StyledLink
            style={{
              textAlign: "center",
              fontSize: 40,
              fontWeight: "bold",
              color: "var(--primary)",
            }}
            target={"_self"}
            href={"https://shibapad.finance"}
          >
            MainPage
          </StyledLink>{" "}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <StyledLink
            style={{
              textAlign: "center",
              fontSize: 40,
              fontWeight: "bold",
              color: "var(--primary)",
            }}
            target={"_self"}
            href={"https://vote.shibapad.finance/"}
          >
            VotingDAPP
          </StyledLink>
        </ResponsiveWrapper>
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 20,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {feedback}
              <s.SpacerSmall></s.SpacerSmall>
            </s.TextTitle>
            <s.TextDescription style={{ color: "var(--secondary-text)" }}>
              Contract address :
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--secondary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS)}
              </StyledLink>
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
              }}
            >
              Your Wallet Address :{" "}
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--secondary)",
              }}
            >
              {blockchain.account}
            </s.TextDescription>
            <s.SpacerSmall />
            <>
              {blockchain.account === "" ||
              blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.TextDescription
                    style={{
                      textAlign: "center",
                      color: "var(--accent-text)",
                    }}
                  >
                    Connect to the {CONFIG.NETWORK.NAME} network
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(connect());
                      getData();
                    }}
                  >
                    CONNECT
                  </StyledButton>
                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {blockchain.errorMsg}
                      </s.TextDescription>
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <s.SpacerSmall />
                  <s.Container
                    ai={"center"}
                    jc={"center"}
                    style={{
                      backgroundColor: "var(--primary)",
                      marginLeft: 40,
                      marginRight: 40,
                      padding: 60,
                      borderRadius: 24,
                      border: "4px dashed var(--primary)",
                      boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
                      width: "60vw",
                      maxWidth: "70vw",
                    }}
                  >
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "3vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      Total Supply : {data.totalSupply / 10 ** 18}
                    </s.TextTitle>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      Circulating Supply : {CirculatingSupply / 10 ** 18}
                    </s.TextTitle>
<s.SpacerSmall/>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      TotalMarketCap : {marketcap}
                    </s.TextTitle>

                    <s.SpacerSmall />
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      Price $ per 1000 SBP: {price}
                    </s.TextTitle>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        color: "var(--accent-text)",
                      }}
                    ></s.TextTitle>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      {" "}
                      <s.SpacerSmall />
                      24H Volume $ : {volume24}
                    </s.TextTitle>
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        color: "var(--accent-text)",
                      }}
                    ></s.TextTitle>
                    <s.SpacerSmall />
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      Liquidity $ :{liquidity}
                    </s.TextTitle>

                    <s.SpacerSmall />
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      $SBP balance : {Balance}
                    </s.TextTitle>
                    <s.SpacerSmall />
                    <s.TextTitle
                      style={{
                        textAlign: "center",
                        fontSize: "2.5vw",
                        fontWeight: "bold",
                        color: "var(--accent-text)",
                      }}
                    >
                      Your $SBP in vote : {votedToken}
                    </s.TextTitle>
                    <s.SpacerSmall />
                    <StyledButton
                      disabled={Claiming ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        Claim();
                        getData();
                      }}
                    >
                      {Claiming ? "BUSY" : "Manual Claim Reward"}
                    </StyledButton>
                  </s.Container>
                  <s.SpacerLarge />
                </>
              )}
            </>

            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet)
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          ></s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
