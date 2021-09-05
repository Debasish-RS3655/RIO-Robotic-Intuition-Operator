
const emptyRows = 0;
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
workbook.creator = "Debashish Buragohain";
workbook.lastModifiedBy = "Debashish Buragohain";
workbook.created = new Date(2021, 7, 30);
workbook.modified = new Date();
workbook.views = [
    {
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
    }
]
const sheet = workbook.addWorksheet('My Sheet');
var worksheet = workbook.getWorksheet('My Sheet');
worksheet.state = 'visible';
worksheet.columns = [
    { key: "A" },
    { key: "B" },
    { key: "C" },
    { key: "D" },
    { key: "E" },
    { key: "F" },
    { key: "G" },
    { key: "H" },
    { key: "I" },
    { key: "J" },
    { key: "K" },
    { key: "L" },
    { key: "M" },
    { key: "N" },
    { key: "O" },
    { key: "P" },
    { key: "Q" },
    { key: "R" },
    { key: "S" },
    { key: "T" },
    { key: "U" },
    { key: "V" },
    { key: "W" },
    { key: "X" },
    { key: "Y" },
    { key: "Z" },
    { key: "AA" },
    { key: "AB" },
    { key: "AC" },
    { key: "AD" },
    { key: "AE" },
    { key: "AF" },
    { key: "AG" },
    { key: "AH" },
    { key: "AI" },
    { key: "AJ" },
    { key: "AK" },
    { key: "AL" },
    { key: "AM" },
    { key: "AN" },
    { key: "AO" },
    { key: "AP" },
    { key: "AQ" },
    { key: "AR" },
    { key: "AS" },
    { key: "AT" },
    { key: "AU" },
    { key: "AV" },
    { key: "AW" },
    { key: "AX" },
    { key: "AY" },
]
const analysisFile = require('./output.json');
let A = []; A.push("cycles"); A.push(undefined);
let B = []; B.push("starting emotion"); B.push("sadness");
let C = []; C.push(undefined); C.push("joy");
let D = []; D.push(undefined); D.push("fear");
let E = []; E.push(undefined); E.push("disgust");
let F = []; F.push(undefined); F.push("anger");
let G = []; G.push(undefined); G.push("surprise");
let H = []; H.push("ending emotion"); H.push("sadness");
let I = []; I.push(undefined); I.push("joy");
let J = []; J.push(undefined); J.push("fear");
let K = []; K.push(undefined); K.push("disgust");
let L = []; L.push(undefined); L.push("anger");
let M = []; M.push(undefined); M.push("surprise");
let N = []; N.push("short term objects"); N.push("stimulus names");
let O = []; O.push(undefined); O.push("influence");
let P = []; P.push("current stimuli influence"); P.push("stimulus names");
let Q = []; Q.push(undefined); Q.push("before alteration");
let R = []; R.push(undefined); R.push(undefined);
let S = []; S.push(undefined); S.push(undefined);
let T = []; T.push(undefined); T.push(undefined);
let U = []; U.push(undefined); U.push(undefined);
let V = []; V.push(undefined); V.push(undefined);
let W = []; W.push(undefined); W.push("after alteration");
let X = []; X.push(undefined); X.push(undefined);
let Y = []; Y.push(undefined); Y.push(undefined);
let Z = []; Z.push(undefined); Z.push(undefined);
let AA = []; AA.push(undefined); AA.push(undefined);
let AB = []; AB.push(undefined); AB.push(undefined);
let AC = []; AC.push(undefined); AC.push("influence");
let AD = []; AD.push("perception change objects"); AD.push("stimulus name");
let AE = []; AE.push(undefined); AE.push("before alteration");
let AF = []; AF.push(undefined); AF.push(undefined);
let AG = []; AG.push(undefined); AG.push(undefined);
let AH = []; AH.push(undefined); AH.push(undefined);
let AI = []; AI.push(undefined); AI.push(undefined);
let AJ = []; AJ.push(undefined); AJ.push(undefined);
let AK = []; AK.push(undefined); AK.push("after alteration");
let AL = []; AL.push(undefined); AL.push(undefined);
let AM = []; AM.push(undefined); AM.push(undefined);
let AN = []; AN.push(undefined); AN.push(undefined);
let AO = []; AO.push(undefined); AO.push(undefined);
let AP = []; AP.push(undefined); AP.push(undefined);
let AQ = []; AQ.push(undefined); AQ.push("influence");
let AR = []; AR.push("decision objects"); AR.push("action");
let AS = []; AS.push(undefined); AS.push("options");
let AT = []; AT.push(undefined); AT.push("speaker");
let AU = []; AU.push(undefined); AU.push("choice");
let AV = []; AV.push('prohibited objects'); AV.push(undefined);
let AW = []; AW.push("posture response"); AW.push("starting pose");
let AX = []; AX.push(undefined); AX.push("ending pose");
let AY = []; AY.push("verbal response"); AY.push(undefined);
let previousRow = 2;        
analysisFile.forEach((el, index) => {
    
    const maxRows = determineMaxLength(el.shortTermObjects, el.currentStimuliInfluence, el.perceptionChangeObjects);
    
    const startingRow = previousRow;
    const endingRow = startingRow + maxRows;
    
    if (index !== null) A.push(index);
    else A.push(undefined);
    fillToSpecifiedLength(A, endingRow);
    
    if (el.startingEmotion !== null) {
        
        B.push(el.startingEmotion[0]);
        
        C.push(el.startingEmotion[1]);
        
        D.push(el.startingEmotion[2]);
        
        E.push(el.startingEmotion[3]);
        
        F.push(el.startingEmotion[4]);
        
        G.push(el.startingEmotion[5]);
    }
    else {
        B.push(undefined);
        C.push(undefined);
        D.push(undefined);
        E.push(undefined);
        F.push(undefined);
        G.push(undefined);
    }
    fillToSpecifiedLength(B, endingRow, el.startingEmotion[0]);
    fillToSpecifiedLength(C, endingRow, el.startingEmotion[1]);
    fillToSpecifiedLength(D, endingRow, el.startingEmotion[2]);
    fillToSpecifiedLength(E, endingRow, el.startingEmotion[3]);
    fillToSpecifiedLength(F, endingRow, el.startingEmotion[4]);
    fillToSpecifiedLength(G, endingRow, el.startingEmotion[5]);
    
    if (el.endingEmotion !== null) {
        
        H.push(el.endingEmotion[0]);
        
        I.push(el.endingEmotion[1]);
        
        J.push(el.endingEmotion[2]);
        
        K.push(el.endingEmotion[3]);
        
        L.push(el.endingEmotion[4]);
        
        M.push(el.endingEmotion[5]);
    }
    else {
        H.push(undefined);
        I.push(undefined);
        J.push(undefined);
        K.push(undefined);
        L.push(undefined);
        M.push(undefined);
    }
    fillToSpecifiedLength(H, endingRow, el.endingEmotion[0]);
    fillToSpecifiedLength(I, endingRow, el.endingEmotion[1]);
    fillToSpecifiedLength(J, endingRow, el.endingEmotion[2]);
    fillToSpecifiedLength(K, endingRow, el.endingEmotion[3]);
    fillToSpecifiedLength(L, endingRow, el.endingEmotion[4]);
    fillToSpecifiedLength(M, endingRow, el.endingEmotion[5]);
    
    
    if (el.shortTermObjects !== null) {
        el.shortTermObjects.forEach(el2 => {
            
            if (el2.stimulusName !== null) N.push(el2.stimulusName);
            else N.push(undefined);
            
            if (el2.influence !== null) O.push(el2.influence);
            else O.push(undefined);
        })
    }
    fillToSpecifiedLength(N, endingRow);
    fillToSpecifiedLength(O, endingRow);
    
    
    if (el.currentStimuliInfluence !== null) {
        el.currentStimuliInfluence.forEach(el2 => {
            
            if (el2.stimulusName !== null) P.push(el2.stimulusName);
            else P.push(undefined);
            
            if (el2.beforeAlteration !== null) {
                Q.push(el2.beforeAlteration[0]);        
                R.push(el2.beforeAlteration[1]);        
                S.push(el2.beforeAlteration[2]);        
                T.push(el2.beforeAlteration[3]);        
                U.push(el2.beforeAlteration[4]);        
                V.push(el2.beforeAlteration[5]);        
            }
            else {
                Q.push(undefined);
                R.push(undefined);
                S.push(undefined);
                T.push(undefined);
                U.push(undefined);
                V.push(undefined);
            }
            
            if (el2.afterAlteration !== null) {
                W.push(el2.afterAlteration[0]);         
                X.push(el2.afterAlteration[1]);         
                Y.push(el2.afterAlteration[2]);         
                Z.push(el2.afterAlteration[3]);         
                AA.push(el2.afterAlteration[4]);         
                AB.push(el2.afterAlteration[5]);         
            }
            else {
                W.push(undefined);
                X.push(undefined);
                Y.push(undefined);
                Z.push(undefined);
                AA.push(undefined);
                AB.push(undefined);
            }
            
            if (el2.influence !== null) AC.push(el2.influence);
            else AC.push(undefined);
        })
    }
    fillToSpecifiedLength(P, endingRow);
    fillToSpecifiedLength(Q, endingRow);
    fillToSpecifiedLength(R, endingRow);
    fillToSpecifiedLength(S, endingRow);
    fillToSpecifiedLength(T, endingRow);
    fillToSpecifiedLength(U, endingRow);
    fillToSpecifiedLength(V, endingRow);
    fillToSpecifiedLength(W, endingRow);
    fillToSpecifiedLength(X, endingRow);
    fillToSpecifiedLength(Y, endingRow);
    fillToSpecifiedLength(Z, endingRow);
    fillToSpecifiedLength(AA, endingRow);
    fillToSpecifiedLength(AB, endingRow);
    fillToSpecifiedLength(AC, endingRow);
    
    if (el.perceptionChangeObjects !== null) {
        el.perceptionChangeObjects.forEach(el2 => {
            
            if (el2.stimulusName !== null) AD.push(el2.stimulusName);
            else AD.push(undefined);
            
            if (el2.beforeAlteration !== null) {
                AE.push(el2.beforeAlteration[0]);   
                AF.push(el2.beforeAlteration[1]);   
                AG.push(el2.beforeAlteration[2]);   
                AH.push(el2.beforeAlteration[3]);   
                AI.push(el2.beforeAlteration[4]);   
                AJ.push(el2.beforeAlteration[5]);   
            }
            else {
                AE.push(undefined);
                AF.push(undefined);
                AG.push(undefined);
                AH.push(undefined);
                AI.push(undefined);
                AJ.push(undefined);
            }
            
            if (el2.afterAlteration !== null) {
                AK.push(el2.afterAlteration[0]);    
                AL.push(el2.afterAlteration[1]);    
                AM.push(el2.afterAlteration[2]);    
                AN.push(el2.afterAlteration[3]);    
                AO.push(el2.afterAlteration[4]);    
                AP.push(el2.afterAlteration[5]);    
            }
            else {
                AK.push(undefined);
                AL.push(undefined);
                AM.push(undefined);
                AN.push(undefined);
                AO.push(undefined);
                AP.push(undefined);
            }
            
            if (el2.influence !== null) AQ.push(el2.influence);
            else AQ.push(undefined);
        })
    }
    fillToSpecifiedLength(AD, endingRow);
    fillToSpecifiedLength(AE, endingRow);
    fillToSpecifiedLength(AF, endingRow);
    fillToSpecifiedLength(AG, endingRow);
    fillToSpecifiedLength(AH, endingRow);
    fillToSpecifiedLength(AI, endingRow);
    fillToSpecifiedLength(AJ, endingRow);
    fillToSpecifiedLength(AK, endingRow);
    fillToSpecifiedLength(AL, endingRow);
    fillToSpecifiedLength(AM, endingRow);
    fillToSpecifiedLength(AN, endingRow);
    fillToSpecifiedLength(AO, endingRow);
    fillToSpecifiedLength(AP, endingRow);
    fillToSpecifiedLength(AQ, endingRow);
    
    if (el.decisionObjects !== null) {
        AR.push(el.decisionObjects.action);                 
        AS.push(el.decisionObjects.options.join(", "));     
        AT.push(el.decisionObjects.speaker);                
        AU.push(el.decisionObjects.choice);                 
    }
    else {
        AR.push(undefined);
        AS.push(undefined);
        AT.push(undefined);
        AU.push(undefined);
    }
    fillToSpecifiedLength(AR, endingRow);
    fillToSpecifiedLength(AS, endingRow);
    fillToSpecifiedLength(AT, endingRow);
    fillToSpecifiedLength(AU, endingRow);
    
    if (el.prohibitedChosen !== null) AV.push(el.prohibitedChosen);
    else AV.push(undefined);
    fillToSpecifiedLength(AV, endingRow);
    
    const maxCharExcel = 32767
    if (el.postureResponse !== null) {
        if (el.postureResponse.startingPose !== null) {
            let startPoseString = JSON.stringify(el.postureResponse.startingPose);
            if (startPoseString.length > maxCharExcel) {
                startPoseString = startPoseString.slice(0, maxCharExcel - 1);
            }
            let endPoseString = JSON.stringify(el.postureResponse.endingPose);
            if (endPoseString.length > maxCharExcel) {
                endPoseString = endPoseString.slice(0, maxCharExcel - 1);
            }
            AW.push(startPoseString);   
            AX.push(endPoseString);     
        }
        else {
            AW.push(undefined);
            AX.push(undefined);
        }
    }
    fillToSpecifiedLength(AW, endingRow);
    fillToSpecifiedLength(AX, endingRow);
    
    if (el.verbalResponse !== null) AY.push(el.verbalResponse);
    else AY.push(undefined);
    fillToSpecifiedLength(AY, endingRow);
    previousRow += maxRows + emptyRows;
})
function fillToSpecifiedLength(arr, endingIndex, givenValue) {
    
    for (var dh = arr.length; dh <= endingIndex; dh++) {
        arr.push(givenValue);
    }
    /*
    const endLength = arr.length + givLength;
    while (arr.length < endLength) {
        arr.push(undefined);
    }*/
}
function determineMaxLength(arr1, arr2, arr3) {
    
    if (arr1 == null) arr1 = [1];
    if (arr2 == null) arr2 = [1];
    if (arr3 == null) arr3 = [1];
    if (arr1.length >= arr2.length && arr1.length >= arr3.length) {
        return arr1.length;
    }
    else if (arr2.length >= arr1.length && arr2.length >= arr3.length) {
        return arr2.length;
    }
    else return arr3.length
}
worksheet.getColumn('A').values = A;
worksheet.getColumn('B').values = B;
worksheet.getColumn('C').values = C;
worksheet.getColumn('D').values = D;
worksheet.getColumn('E').values = E;
worksheet.getColumn('F').values = F;
worksheet.getColumn('G').values = G;
worksheet.getColumn('H').values = H;
worksheet.getColumn('I').values = I;
worksheet.getColumn('J').values = J;
worksheet.getColumn('K').values = K;
worksheet.getColumn('L').values = L;
worksheet.getColumn('M').values = M;
worksheet.getColumn('N').values = N;
worksheet.getColumn('O').values = O;
worksheet.getColumn('P').values = P;
worksheet.getColumn('Q').values = Q;
worksheet.getColumn('R').values = R;
worksheet.getColumn('S').values = S;
worksheet.getColumn('T').values = T;
worksheet.getColumn('U').values = U;
worksheet.getColumn('V').values = V;
worksheet.getColumn('W').values = W;
worksheet.getColumn('X').values = X;
worksheet.getColumn('Y').values = Y;
worksheet.getColumn('Z').values = Z;
worksheet.getColumn('AA').values = AA;
worksheet.getColumn('AB').values = AB;
worksheet.getColumn('AC').values = AC;
worksheet.getColumn('AD').values = AD;
worksheet.getColumn('AE').values = AE;
worksheet.getColumn('AF').values = AF;
worksheet.getColumn('AG').values = AG;
worksheet.getColumn('AH').values = AH;
worksheet.getColumn('AI').values = AI;
worksheet.getColumn('AJ').values = AJ;
worksheet.getColumn('AK').values = AK;
worksheet.getColumn('AL').values = AL;
worksheet.getColumn('AM').values = AM;
worksheet.getColumn('AN').values = AN;
worksheet.getColumn('AO').values = AO;
worksheet.getColumn('AP').values = AP;
worksheet.getColumn('AQ').values = AQ;
worksheet.getColumn('AR').values = AR;
worksheet.getColumn('AS').values = AS;
worksheet.getColumn('AT').values = AT;
worksheet.getColumn('AU').values = AU;
worksheet.getColumn('AV').values = AV;
worksheet.getColumn('AW').values = AW;
worksheet.getColumn('AX').values = AX;
worksheet.getColumn('AY').values = AY;
workbook.xlsx.writeFile('outputExcelFile.xlsx');
console.log("Done");