import * as odd from "@oddjs/odd";
import * as fission from "@oddjs/odd/compositions/fission";
import { getRecoil, setRecoil } from "recoil-nexus";
import { sessionStore, filesystemStore } from "./stores";
import { SESSION_ERROR } from "./session";
import { getBackupStatus, type BackupStatus } from "./auth/backup";
import { USERNAME_STORAGE_KEY, createDID } from "./auth/account";
import { ODD_NAMESPACE } from "./app-info";
// import * as BaseCrypto from "./odd-components/crypto/implementation/mobile";

const initialize = async (): Promise<void> => {
  try {
    let backupStatus: BackupStatus = null;

    // const cryptoImplementation = await BaseCrypto.implementation({
    //   storeName: "collector",
    //   exchangeKeyName: "exchange-key",
    //   writeKeyName: "write-key",
    // });
    // alert("before");
    const config = {
      namespace: ODD_NAMESPACE,
      debug: process.env.NODE_ENV === "development",
      // crypto: cryptoImplementation,
    };
    const components = await fission.components(config);
    console.log("components", components);
    const program = await odd.program(config, components);

    // CUSTOM SERVER ENDPOINTS
    // // runfission.net = staging
    // program.endpoints({
    //   api: 'https://runfission.net',
    //   lobby: 'https://auth.runfission.net',
    //   user: 'fissionuser.net'
    // })

    let session;
    const isRegistering = true;

    alert("program");

    // Do we have an existing session?
    if (program.session) {
      session = program.session;
      console.log("session 1", session);
      // If not, let's authenticate.
      // (a) new user, register a new Fission account
    } else if (isRegistering) {
      const { success } = await program.auth.register({ username: "llama" });
      session = success ? program.auth.session() : null;
      console.log("session 2", session);

      // (b) existing user, link a new device
    } else {
      console.log("session 3", session);
      // On device with existing session:
      const producer = await program.auth.accountProducer(
        program?.session?.username
      );

      producer.on("challenge", (challenge) => {
        console.log("challenge", challenge);
        // Either show `challenge.pin` or have the user input a PIN and see if they're equal.
        // if (userInput === challenge.pin) challenge.confirmPin();
        // else challenge.rejectPin();
      });

      producer.on("link", ({ approved }) => {
        if (approved) console.log("Link device successfully");
      });

      // On device without session:
      //     Somehow you'll need to get ahold of the username.
      //     Few ideas: URL query param, QR code, manual input.
      const consumer = await program.auth.accountConsumer("llama");

      consumer.on("challenge", ({ pin }) => {
        console.log("pin", pin);
        // showPinOnUI(pin);
      });

      consumer.on("link", async ({ approved, username }) => {
        if (approved) {
          console.log(`Successfully authenticated as ${username}`);
          session = await program.auth.session();
        }
      });
    }

    // if (program.session) {
    //   // Authed
    //   backupStatus = await getBackupStatus(program.session.fs);

    //   let fullUsername = (await program.components.storage.getItem(
    //     USERNAME_STORAGE_KEY
    //   )) as string;

    //   // // If the user is migrating from a version odd-app-template before https://github.com/oddsdk/odd-app-template/pull/97/files#diff-a180510e798b8f833ebfdbe691c5ec4a1095076980d3e2388de29c849b2b8361R44,
    //   // // their username won't contain a did, so we will need to manually append a DID and add it storage here
    //   // if (!fullUsername) {
    //   //   const did = await createDID(program.components.crypto);
    //   //   fullUsername = `${program.session.username}#${did}`;
    //   //   await program.components.storage.setItem(
    //   //     USERNAME_STORAGE_KEY,
    //   //     fullUsername
    //   //   );
    //   //   window.location.reload();
    //   // }

    //   setRecoil(sessionStore, {
    //     username: {
    //       full: fullUsername,
    //       hashed: program.session.username,
    //       trimmed: fullUsername.split("#")[0],
    //     },
    //     session: program.session,
    //     authStrategy: program.auth,
    //     program,
    //     loading: false,
    //     backupCreated: backupStatus.created,
    //   });

    //   setRecoil(filesystemStore, program.session.fs);
    // } else {
    //   // Not authed

    //   setRecoil(sessionStore, {
    //     username: null,
    //     session: null,
    //     authStrategy: program.auth,
    //     program,
    //     loading: false,
    //     backupCreated: null,
    //   });
    // }
  } catch (error) {
    console.error(error);
    // alert(error);
    const session = getRecoil(sessionStore);

    switch (error) {
      case odd.ProgramError.InsecureContext:
        setRecoil(sessionStore, {
          ...session,
          loading: false,
          error: SESSION_ERROR.INSECURE_CONTEXT,
        });
        break;

      case odd.ProgramError.UnsupportedBrowser:
        setRecoil(sessionStore, {
          ...session,
          loading: false,
          error: SESSION_ERROR.UNSUPORTED_CONTEXT,
        });
        break;
    }
  }
};

export default initialize;
