import { useParams } from 'react-router-dom';

export default function DatabaseSearch() {
    //state
    const { id } = useParams();

    //comportement

    //affichage
    return (
        <div>
          <h1>DatabaseSearch : {id}</h1>
        </div>
      );
}