import Image from '../../components/Image';
import DBSLoading from './DBSLoading';

const CardPhylogeny = ({ file }) => {
    const phylogenyEmpty = !file;

    if (phylogenyEmpty) {
        return <DBSLoading />;
    }

    return (
        <div>
            <Image file={file} />
        </div>
    );
};

export default CardPhylogeny;